import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../../config.js'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
const prisma = new PrismaClient({ adapter })

export async function getProgress(userId: string, parentId: string | null = null) {
  const nodes = await prisma.node.findMany({
    where: { userId, parentId },
    select: {
      id: true,
      title: true,
      status: true
    },
    orderBy: parentId === null ? {
      sort: 'asc'
    } : {
      step: 'asc'
    }
  })
  const total: number = nodes.length
  const done: number = nodes.filter(n => n.status === "done").length
  const current = nodes.find(n => n.status === "in_progress") ?? nodes.find(n => n.status === "todo") ?? null
  const percentage: number = total === 0 ? 0 : Math.round((done / total) * 100)
  return {total, done, current, percentage}
}
