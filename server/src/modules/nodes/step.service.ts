import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../../config.js'
import { NotFoundError, ValidationError } from '../../utils/errors.js'
import { propagateStatus } from './nodes.service.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

export async function reindexSteps(parentId: string) {
    await prisma.$transaction(async (prisma) => {
        const children = await prisma.node.findMany({
            where: { parentId: parentId }, 
            orderBy: { step: 'asc' }
        })
        let i:number = 1
        for (let child of children) {
            await prisma.node.update({
                where: {
                    id: child.id
                },
                data: {
                    step: i
                }
            })
            i++
        }
    })
}

export async function reorderSteps(userId: string, parentId: string, orderedIds: string[]) {
    try {
        await prisma.$transaction(async (prisma) => {
            const pid = parentId === "null" ? null : parentId
            const children = await prisma.node.findMany({ where: { userId, parentId: pid } })
            const childIds = new Set(children.map(c => c.id))
            if(orderedIds.length !== childIds.size || orderedIds.some(id => !childIds.has(id))) {
                throw new ValidationError()
            }
            for (const [i, id] of orderedIds.entries()) {
                await prisma.node.update({
                    where: {
                        id: id,
                        userId: userId
                    },
                    data: {
                        step: i + 1
                    }
                })
            }
        }) 
    } catch (error) {
        if (error instanceof ValidationError) {
            throw new ValidationError()
        } 
        throw new NotFoundError()
    }
    
}

export async function reorderNodes(userId: string, parentId: string, orderedIds: string[]) {
    try {
        await prisma.$transaction(async (prisma) => {
            const pid = parentId === "null" ? null : parentId
            const children = await prisma.node.findMany({ where: { userId, parentId: pid } })
            const childIds = new Set(children.map(c => c.id))
            if(orderedIds.length !== childIds.size || orderedIds.some(id => !childIds.has(id))) {
                throw new ValidationError()
            }
            for (const [i, id] of orderedIds. entries()) {
                await prisma.node.update({
                    where: {
                        id: id,
                        userId: userId
                    },
                    data: {
                        sort: i + 1
                    }
                })
            }
        })
    } catch (error) {
        if (error instanceof ValidationError) {
            throw new ValidationError()
        }      
        throw new NotFoundError()
    }
}

export async function toggleType(userId: string, nodeId: string, newType: string) {
    await prisma.$transaction(async (prisma) => {
        const parent = await prisma.node.findUnique({
            where: {
                userId: userId,
                id: nodeId
            },
            include: {
                children: {
                    orderBy: {
                        sort: 'asc'
                    }
                }
            }
        })
        if(parent !== null) {
            if (newType === 'phase' || newType === 'task') {
                await prisma.node.update({
                    where: {
                        id: nodeId
                    },
                    data: {
                        nodetype: newType
                    }
                })
            }
            if (parent?.nodetype === 'task' && newType === 'phase') {
                let i:number = 1
                for (const child of parent.children) {
                    await prisma.node.update({
                        where: {
                            id: child.id
                        },
                        data: {
                            step: i
                        }
                    })
                    i++
                }
            } else if (parent?.nodetype === 'phase' && newType === 'task') {
                for (const child of parent.children) {
                    await prisma.node.update({
                        where: {
                            id: child.id
                        },
                        data: {
                            sort: child.step
                        }
                    })
                }
            }
        } else {
            throw new NotFoundError()
        }
    })
}

export async function addSteps(userId:string, parentId:string, steps:{ title: string, nodeType: 'task' | 'phase' }[]) {
    return await prisma.$transaction(async (prisma) => {
        const parent = await prisma.node.findUnique({
            where: {
                userId: userId,
                id: parentId
            }
        })
        if (parent === null) {
            throw new NotFoundError()
        }
        if (parent.nodetype === 'phase') {
            const maxStep = await prisma.node.aggregate({
                where: {
                    parentId: parentId
                },
                _max: {
                    step: true
                }
            })
            const newSteps = await prisma.node.createManyAndReturn({
                data: steps.map((step, i) => ({
                    userId: userId,
                    parentId: parentId,
                    title: step.title,
                    nodetype: step.nodeType,
                    priority: 'medium',
                    deadline: null,
                    step: (maxStep._max.step ?? 0) + i + 1,
                }))
            })
            await propagateStatus(prisma, userId, parentId)
            return newSteps
        } else {
            throw new ValidationError()
        }
    })
}