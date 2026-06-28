import type { TreeNode, PhaseProgress } from "../types"

export const getPhaseProgress = (node: TreeNode): PhaseProgress => {
    const total: number = node.children.length
    const done: number = node.children.filter(n => n.status === "done").length
    const current: TreeNode | null = node.children.find(n => n.status === "in_progress") ?? node.children.find(n => n.status === "todo") ?? null
    const percentage: number = total === 0 ? 0 : Math.round((done / total) * 100)
    return {total, done, current, percentage}
}