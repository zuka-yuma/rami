import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../../config.js'
import type { importNodeSchemaType, importSchemaType } from './import.schema.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

export async function importJSON(userId: string, data: importSchemaType) {
    return await prisma.$transaction(async (prisma) => {
        const createJSONNode = async (parentId: string | null, data: importNodeSchemaType) => {
            const node = {
                userId: userId,
                parentId: parentId,
                title: data.title,
                nodetype: data.nodetype,
                status: data.status,
                priority: data.priority,
                deadline: data.deadline ? new Date(data.deadline) : null,
                step: data.step ?? 0,
                sort: data.sort ?? 0,
            }
            const nodeData = await prisma.node.create({
                data: node
            })
            for (const child of data.children) {
                await createJSONNode(nodeData.id, child)
            }
        }
        await prisma.node.deleteMany({ where: { userId }})
        for (const d of data) {
            await createJSONNode(null, d)
        }
    })
}
