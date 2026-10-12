import { describe, expect, it } from 'vitest'
import { getPhaseProgress } from './phaseProgress.js'
import type { Node, TreeNode } from '../types/index.js'

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
  createAt: '2026-01-01T00:00:00Z',
  updateAt: '2026-01-01T00:00:00Z'
})
const node = (overrides: Partial<Node> = {}): Node => ({ ...base(), ...overrides })

describe("get phase progress", () => {
  it("no child", () => {
    const tree: TreeNode = { ...node({ nodeType: "phase"}), children: []}
    expect(getPhaseProgress(tree)).toEqual({total: 0, done: 0, current: null, percentage: 0})
  })

  it("all todo", () => {
    const firstNode = { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 3 }), children: [] }
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        firstNode,
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 9 }), children: [] },
        { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 6 }), children: [] },
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 0, current: firstNode, percentage: 0})
  })

  it("mixed", () => {
    const targetNode = { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 6, status: "in_progress" }), children: [] }
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 3, status: "done" }), children: [] },
        targetNode,
        { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 9, status: "todo" }), children: [] }
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 1, current: targetNode, percentage: 33})
  })

  it("all done", () => {
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 3, status: "done" }), children: [] },
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 9, status: "done" }), children: [] },
        { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 6, status: "done" }), children: [] }
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 3, current: null, percentage: 100})
  })

  it("done and todo", () => {
    const targetNode = { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 6, status: "todo" }), children: [] }
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 3, status: "done" }), children: [] },
        targetNode,
        { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 9, status: "todo" }), children: [] }
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 1, current: targetNode, percentage: 33})
  })

  it("first of in_progress", () => {
    const targetNode = { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 6, status: "in_progress" }), children: [] }
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 3, status: "done" }), children: [] },
        targetNode,
        { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 9, status: "in_progress" }), children: [] },
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 1, current: targetNode, percentage: 33})
  })

  it("round 66.6%", () => {
    const targetNode = { ...node({ nodeType: "phase", id: "3", parentId: "0", step: 9, status: "in_progress" }), children: [] }
    const tree: TreeNode = {
      ...node({ nodeType: "phase", id: "0" }), children: [
        { ...node({ nodeType: "phase", id: "1", parentId: "0", step: 6, status: "done" }), children: [] },
        targetNode,
        { ...node({ nodeType: "phase", id: "2", parentId: "0", step: 3, status: "done" }), children: [] },
      ]
    }
    expect(getPhaseProgress(tree)).toEqual({total: 3, done: 2, current: targetNode, percentage: 67})
  })
})
