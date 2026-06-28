// phase ノードを描画するコンポーネント。
// TreeNode の phase 版。展開時に StepProgress（進捗ライン）と
// 番号付きの子ステップを表示する。

import type { TreeNode as TreeNodeType, Status } from "../types"
import { useState } from "react"
import { useTreeContext } from "../contexts/TreeContext"
import StepProgress from "./StepProgress"
import NodeRenderer from "./NodeRenderer"
import NodeDetail from "./NodeDetail"

interface Props {
    node: TreeNodeType
}

const statusColor = (status: Status) => {
    switch (status) {
        case "todo": return "bg-gray-300"
        case "in_progress": return "bg-yellow-400"
        case "done": return "bg-green-500"
    }
}

const priorityColor = (priority: TreeNodeType["priority"]) => {
    switch (priority) {
        case "high": return "bg-red-500 text-white"
        case "medium": return "bg-orange-300"
        case "low": return "bg-blue-200"
    }
}

const nextStatus = (status: Status): Status => {
    switch (status) {
        case "todo": return "in_progress"
        case "in_progress": return "done"
        case "done": return "todo"
    }
}

export default function PhaseNode({ node }: Props) {
    const { addNode, updateNode, removeNode } = useTreeContext()
    const [collapsed, setCollapsed] = useState<boolean>(node.collapse)
    const [editing, setEditing] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>(node.title)
    const [detailOpen, setDetailOpen] = useState<boolean>(false)

    const handleStatusClick = async () => {
        await updateNode(node.id, { status: nextStatus(node.status) })
    }

    const handleAddChild = async () => {
        const title = window.prompt("ステップのタイトル")
        if (!title) return
        await addNode({
            title,
            parentId: node.id,
            nodeType: "task",
            priority: "medium",
        })
    }

    const handleRemove = async () => {
        if (!window.confirm(`「${node.title}」を削除しますか？子も全て削除されます`)) return
        await removeNode(node.id)
    }

    const saveTitle = async () => {
        await updateNode(node.id, { title: draft })
        setEditing(false)
    }

    const cancelTitle = () => {
        setDraft(node.title)
        setEditing(false)
    }

    return (
        <li className="my-1">
            {/* 背景色とボーダーで phase であることを視覚的に区別 */}
            <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded border-l-4 border-purple-400">
                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Phase</span>

                {node.children.length > 0 && (
                    <button type="button" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? "▶︎" : "▼"}
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleStatusClick}
                    className={`inline-block w-3 h-3 rounded-full ${statusColor(node.status)}`}
                    aria-label="status"
                />

                {editing ? (
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle()
                            if (e.key === "Escape") cancelTitle()
                        }}
                        autoFocus
                    />
                ) : (
                    <span onClick={() => setEditing(true)}>{node.title}</span>
                )}

                <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(node.priority)}`}>
                    {node.priority}
                </span>

                <button type="button" onClick={() => setDetailOpen(!detailOpen)} className="text-xs ml-2">
                    {detailOpen ? "詳細▲" : "詳細▼"}
                </button>
                <button type="button" onClick={handleAddChild} className="text-xs ml-2">＋ステップ</button>
                <button type="button" onClick={handleRemove} className="text-xs text-red-500">削除</button>
            </div>

            {detailOpen && <NodeDetail node={node} />}

            {/* 展開時: 上部にプログレスライン、子ステップを番号付き (ol) で並べる */}
            {!collapsed && node.children.length > 0 && (
                <div className="ml-4 mt-1">
                    <StepProgress steps={node.children} />
                    <ol className="ml-4 list-decimal">
                        {node.children.map(child => (
                            <NodeRenderer key={child.id} node={child} />
                        ))}
                    </ol>
                </div>
            )}
        </li>
    )
}
