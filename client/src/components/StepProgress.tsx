// phase ノードの子（ステップ）の進捗を可視化するプログレスライン。
// done = ● / in_progress = ◐ / todo = ○ を横並びで描画し、間を ── で繋ぐ。

import type { TreeNode, Status } from "../types"

interface Props {
    steps: TreeNode[]   // phase の children
}

const statusGlyph = (status: Status) => {
    switch (status) {
        case "done": return "●"
        case "in_progress": return "◐"
        case "todo": return "○"
    }
}

const isOverdue = (deadline: string | null) => deadline != null && new Date(deadline) < new Date()

// ステータス●と同じ色で。遅延(in_progress かつ期限切れ)=オレンジ、期限切れ(todo)=赤。
const statusTextColor = (step: TreeNode) => {
    const overdue = isOverdue(step.deadline)
    switch (step.status) {
        case "done": return "text-gray-400"
        case "in_progress": return overdue ? "text-orange-500" : "text-green-500"
        case "todo": return overdue ? "text-red-500" : "text-slate-400"
    }
}

export default function StepProgress({ steps }: Props) {
    if (steps.length === 0) return null

    return (
        <div className="flex items-center gap-1 text-lg">
            {steps.map((step, index) => (
                <span key={step.id} className="flex items-center gap-1">
                    {/* ステップ記号: ホバーでタイトルが title 属性として表示される */}
                    <span className={statusTextColor(step)} title={step.title}>
                        { statusGlyph(step.status) }
                    </span>
                    {/* 末尾以外に区切り線を入れる */}
                    {index < steps.length - 1 && (
                        <span className="text-gray-300">──</span>
                    )}
                </span>
            ))}
        </div>
    )
}
