import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../../config.js'
import type { createNodeSchemaType, updateNodeSchemaType } from './nodes.schema.js'
import { NotFoundError, ValidationError } from '../../utils/errors.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { reindexSteps } from './step.service.js'
import { buildTree } from './tree.utils.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

export async function getAll(userId: string) {
    const node = await prisma.node.findMany({ where: { userId } })
    return buildTree(node)
}

export async function createNode(userId: string, data: createNodeSchemaType) {
    return await prisma.$transaction(async (prisma) => {
        const createNodeData = {
            userId: userId,
            parentId: data.parentId ?? null,
            title: data.title,
            nodetype: data.nodeType,
            priority: data.priority,
            deadline: data.deadline ? new Date(data.deadline) : null,
            step: 0,
            sort: 0,
            
        }
        
        if (data.parentId !== undefined) {
            const parent = await prisma.node.findUnique({ where: { userId: userId, id: data.parentId } })
            if (!parent) {
                throw new NotFoundError()
            } else {
                if (parent.nodetype === 'phase') {
                    const phaseMax = await prisma.node.aggregate({ where: { userId: userId, parentId: data.parentId }, _max: { step: true } })
                    createNodeData.step = (phaseMax._max.step ?? 0) + 1
                } else if (parent.nodetype ===  'task') {
                    const taskMax = await prisma.node.aggregate({ where: { userId: userId, parentId: data.parentId }, _max: { sort: true } })
                    createNodeData.sort = (taskMax._max.sort ?? 0) + 1
                }
            }
        }
        
        const nodeData = await prisma.node.create({
            data: createNodeData
        })
        return nodeData
    })
}

export async function updateNode(userId: string, nodeId: string, data: updateNodeSchemaType) {
    try {
        const updateDatas: any = {}
        if (data.title !== undefined) {
            updateDatas.title = data.title
        }
        if (data.status !== undefined) {
            updateDatas.status = data.status
        }
        if (data.priority !== undefined) {
            updateDatas.priority = data.priority
        }
        if (data.deadline !== undefined) {
            updateDatas.deadline = data.deadline ? new Date(data.deadline) : null
        }
        if (data.collapse !== undefined) {
            updateDatas.collapse = data.collapse
        }
        const nodeData = await prisma.node.update({ 
            where: { id: nodeId, userId },
            data: updateDatas
        })
        return nodeData
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new NotFoundError()
        }
    }
}

export async function deleteNode(userId: string, nodeId: string) {
    try {
        const nodeData = await prisma.node.delete({ 
            where: { id: nodeId, userId }
        })
        if (nodeData.parentId !== null) {
            const parent = await prisma.node.findUnique({
                where: { id: nodeData.parentId }
            })
            if (parent !== null && parent.nodetype === 'phase') {
                await reindexSteps(nodeData.parentId)
            }
        }
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new NotFoundError()
        }
    }
}

export async function moveNode(userId: string, nodeId: string, newParentId: string | null) {
    try {
        const oldParentId = await prisma.$transaction(async (prisma) => {
            if (await checkParent(nodeId, newParentId, userId)) {
                const node = await prisma.node.findUnique({
                    where: {
                        userId: userId,
                        id: nodeId
                    }
                })
                await prisma.node.update({ 
                    where: { 
                        userId: userId,
                        id: nodeId 
                    },
                    data: {
                        parentId: newParentId ?? null
                    }
                })
                if (newParentId !== null) {
                    const parent = await prisma.node.findUnique({
                        where: {
                            userId: userId,
                            id: newParentId
                        }
                    })
                    if (parent?.nodetype === 'phase') {
                        const maxStep = await prisma.node.aggregate({
                            where: {
                                parentId: newParentId
                            },
                            _max: {
                                step: true
                            }
                        })
                        await prisma.node.update({ 
                            where: { userId: userId, id: nodeId },
                            data: {
                                step: (maxStep._max.step ?? 0) + 1
                            }
                        })
                    } else if (parent?.nodetype === 'task') {
                        const maxSort = await prisma.node.aggregate({
                            where: {
                                parentId: newParentId
                            },
                            _max: {
                                sort: true
                            }
                        })
                        await prisma.node.update({ 
                            where: { userId: userId, id: nodeId },
                            data: {
                                sort: (maxSort._max.sort ?? 0) + 1
                            }
                        })
                    }
                }
                if (node !== null && node.parentId !== null) {
                    const oldParent = await prisma.node.findUnique({
                        where: {
                            userId: userId,
                            id: node.parentId
                        }
                    })
                    if (oldParent?.nodetype === 'phase') {
                        return oldParent.id
                    }
                }
            }
            return null
        })
        if (oldParentId !== null) {
            await reindexSteps(oldParentId)
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            throw new ValidationError()
        }        
        throw new NotFoundError()
    }
}

async function checkParent(keyId: string, nodeId: string | null, userId: string) {
    if (nodeId !== null) {
        const node = await prisma.node.findUnique({
            where: {
                userId: userId,
                id: nodeId
            }
        })
        if (node !== null) {
            if (node?.id === keyId) {
                throw new ValidationError()
            }
            if (node?.parentId !== null) {
                return checkParent(keyId, node.parentId, userId)
            } else {
                return true
            }
        } else {
            throw new NotFoundError()
        }
    } else {
        return true
    }
}