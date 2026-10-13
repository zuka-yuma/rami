import { beforeEach, describe, expect, it } from "vitest"
import { toggleType } from "./step.service.js"
import { prisma } from "../../test/setup.js"
import { NotFoundError } from "../../utils/errors.js"

describe("toggleType", () => {
  let userId: string
  let otherUserId: string
  let parentId: string
  beforeEach(async () => {
    const userData = await prisma.user.create({
        data: {
            email: "test@example.com",
            name: "test",
            password: "testpass",
        }
    })
    const otherUserData = await prisma.user.create({
        data: {
            email: "other@example.com",
            name: "other",
            password: "otherpass",
        }
    })
    const parent = await prisma.node.create({
      data: {
        userId: userData.id,
        parentId: null,
        nodeType: "task",
        title: "toggleType test",
        sort: 0,
      }
    })
    await prisma.node.create({
      data: {
        userId: userData.id,
        parentId: parent.id,
        nodeType: "task",
        title: "toggleType test child 1",
        sort: 10,
      }
    })
    await prisma.node.create({
      data: {
        userId: userData.id,
        parentId: parent.id,
        nodeType: "task",
        title: "toggleType test child 2",
        sort: 20,
      }
    })
    await prisma.node.create({
      data: {
        userId: userData.id,
        parentId: parent.id,
        nodeType: "task",
        title: "toggleType test child 3",
        sort: 30,
      }
    })
    userId = userData.id
    otherUserId = otherUserData.id
    parentId = parent.id
  })

  it("toggle type to phase", async () => {
    await toggleType(userId, parentId, "phase")
    const result = await prisma.node.findUnique({
      where: {
        id: parentId
      },
      include: {
        children: {
          orderBy: {
            step: 'asc'
          }
        }
      }
    })
    expect(result?.nodeType).toBe("phase")
    expect(result?.children[0].step).toBe(1)
    expect(result?.children[1].step).toBe(2)
    expect(result?.children[2].step).toBe(3)
  })

  it("toggle type to task", async () => {
    await toggleType(userId, parentId, "phase")
    await toggleType(userId, parentId, "task")
    const result = await prisma.node.findUnique({
      where: {
        id: parentId
      },
      include: {
        children: {
          orderBy: {
            sort: 'asc'
          }
        }
      }
    })
    expect(result?.nodeType).toBe("task")
    expect(result?.children[0].sort).toBe(1)
    expect(result?.children[1].sort).toBe(2)
    expect(result?.children[2].sort).toBe(3)
  })

  it("not exist nodeId", async () => {
    await expect(async () => {
      await toggleType(userId, "not exist nodeId", "task")
    }).rejects.toThrow(NotFoundError)
  })

  it("other user nodeId", async () => {
    await expect(async () => {
      await toggleType(otherUserId, parentId, "task")
    }).rejects.toThrow(NotFoundError)
  })
})
