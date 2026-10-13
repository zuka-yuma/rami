import { describe, expect, it } from "vitest"
import { deriveStatus } from "./nodes.service.js"
import { type Node } from "../../generated/prisma/index.js"
import { buildTree } from "./tree.utils.js"

const base = (): Node => ({
  id: `node-0`,
  title: "sample",
  userId: "user",
  parentId: null,
  nodeType: "task",
  status: "todo",
  priority: "medium",
  deadline: null,
  sort: 0,
  step: 0,
  collapse: false,
  createAt: new Date('2026-01-01T00:00:00Z'),
  updateAt: new Date('2026-01-01T00:00:00Z')
})
const node = (overrides: Partial<Node> = {}): Node => ({...base(), ...overrides})

describe("deriveStatus", () => {
  it("derive done", () => {
    expect(deriveStatus([node({ status: "done" }), node({ status: "done" }), node({ status: "done" })])).toBe("done")
  })

  it("derive in_progress", () => {
    expect(deriveStatus([node({ status: "in_progress" }), node({ status: "done" }), node({ status: "done" })])).toBe("in_progress")
  })

  it("derive todo", () => {
    expect(deriveStatus([node({ status: "todo" }), node({ status: "todo" }), node({ status: "done" })])).toBe("todo")
  })

  it("derive empty", () => {
    expect(deriveStatus([])).toBe("done")
  })
})

describe("buildTree", () => {
  it("build tasks", () => {
    const taskTree = buildTree([
      node({ id: "1", parentId: null, nodeType: "task" }),
      node({ id: "2", parentId: "1", sort: 20 }),
      node({ id: "3", parentId: "1", sort: 10 })
    ])
    const childIds = taskTree[0].children.map(child => child.id)
    expect(childIds).toEqual(["3", "2"])
  })

  it("build phase", () => {
    const phaseTree = buildTree([
      node({ id: "1", parentId: null, nodeType: "phase" }),
      node({ id: "2", parentId: "1", step: 10, sort: 20 }),
      node({ id: "3", parentId: "1", step: 20, sort: 10 })
    ])
    const childIds = phaseTree[0].children.map(child => child.id)
    expect(childIds).toEqual(["2", "3"])
  })

  it("build three gen Tree", () => {
    const tree = buildTree([
      node({ id: "1", parentId: null, nodeType: "task" }),
      node({ id: "2", parentId: "1", nodeType: "phase", sort: 20 }),
      node({ id: "3", parentId: "2", sort: 10, step: 20 }),
      node({ id: "4", parentId: "2", sort: 20, step: 10 })
    ])
    const childIds = tree[0].children[0].children.map(child => child.id)
    expect(childIds).toEqual(["4", "3"])
  })

  it("build random order", () => {
    const tree = buildTree([
      node({ id: "4", parentId: "2", sort: 20, step: 10 }),
      node({ id: "2", parentId: "1", nodeType: "phase", sort: 20 }),
      node({ id: "3", parentId: "2", sort: 10, step: 20 }),
      node({ id: "1", parentId: null, nodeType: "task" }),
    ])
    const childIds = tree[0].children[0].children.map(child => child.id)
    expect(childIds).toEqual(["4", "3"])
  })

  it("build blank", () => {
    const tree = buildTree([node({ id: "1", parentId: null, nodeType: "task" })])
    const childIds = tree[0].children.map(child => child.id)
    expect(childIds).toEqual([])
  })

})
