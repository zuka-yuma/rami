import { prisma } from './setup.js'
import { describe, expect, it } from 'vitest'

describe('db-access', async () => {
  it('connection', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test-user',
        email: 'test@example.com',
        password: 'password',
      },
    })
    const node = await prisma.node.create({
      data: {
        title: 'db-access-test',
        userId: user.id,
      },
    })
    const nodeById = await prisma.node.findUnique({
      where: {
        id: node.id,
      },
    })
    expect(nodeById?.userId).toBe(user.id)
  })
})
