import { describe, expect, it } from 'vitest'
import { stepChangeAllowed } from './nodeStatus.js'
import type { TreeNode, Status } from '../types/index.js'
import { node } from '../test/factory.js'

const allowPhaseFlags = (statuses: Status[]): boolean[] => {
  const children: TreeNode[] = statuses.map((status, i) => ({
    ...node({ id: `c${i}`, parentId: "p", status, step: i + 1 }),
    children: []
  }))
  const tree: TreeNode = {
    ...node({ nodeType: "phase", id: "p", parentId: null }), children: [
      ...children
    ]
  }
  return children.map(c => stepChangeAllowed(c, [tree]))
}

describe("step change allowed", () => {
  it("parent task", () => {
    const tree: TreeNode = {
      ...node({ nodeType: "task", id: "0", parentId: null}), children: [
        { ...node({ nodeType: "phase", id: "1", parentId: "0", sort: 3, status: "todo" }), children: [] },
        { ...node({ nodeType: "phase", id: "2", parentId: "0", sort: 6, status: "in_progress" }), children: [] },
        { ...node({ nodeType: "phase", id: "3", parentId: "0", sort: 9, status: "done" }), children: [] }
      ]
    }
    const trees = [tree]
    expect(stepChangeAllowed(tree.children[1], trees)).toEqual(true)
  })

  it("all todo", () => {
    expect(allowPhaseFlags(["todo", "todo", "todo"])).toEqual([true, false, false])
  })
  it("in_progress todo todo", () => {
    expect(allowPhaseFlags(["in_progress", "todo", "todo"])).toEqual([true, true, false])
  })
  it("in_progress in_progress todo", () => {
    expect(allowPhaseFlags(["in_progress", "in_progress", "todo"])).toEqual([true, false, true])
  })
  it("done in_progress todo", () => {
    expect(allowPhaseFlags(["done", "in_progress", "todo"])).toEqual([true, true, true])
  })
  it("all done", () => {
    expect(allowPhaseFlags(["done", "done", "done"])).toEqual([true, true, true])
  })
  it("done todo in_progress", () => {
    expect(allowPhaseFlags(["done", "todo", "in_progress"])).toEqual([true, true, false])
  })
})
