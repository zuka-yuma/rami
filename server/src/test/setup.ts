import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../config.js'
import { afterEach, afterAll } from 'vitest'

const adapter = new PrismaPg({ connectionString: config.databaseURL })
export const prisma = new PrismaClient({ adapter })

afterEach(async () => {
  await prisma.node.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
