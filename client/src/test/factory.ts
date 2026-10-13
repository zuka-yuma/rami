import type { Node } from '../types/index.js'

export const base = (): Node => ({
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
export const node = (overrides: Partial<Node> = {}): Node => ({ ...base(), ...overrides })
