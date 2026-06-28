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

const statusTextColor = (status: Status) => {
    switch (status) {
        case "done": return "text-gray-600"
        case "in_progress": return "text-green-500"
        case "todo": return "text-black-300"
    }
}

export default function StepProgress({ steps }: Props) {
    if (steps.length === 0) return null

    return (
        <div className="flex items-center gap-1 text-lg">
            {steps.map((step, index) => (
                <span key={step.id} className="flex items-center gap-1">
                    {/* ステップ記号: ホバーでタイトルが title 属性として表示される */}
                    <span className={statusTextColor(step.status)} title={step.title}>
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
