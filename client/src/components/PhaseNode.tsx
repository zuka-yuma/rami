// phase ノードを描画するコンポーネント。
// TreeNode の phase 版。展開時に StepProgress（進捗ライン）と
// 番号付きの子ステップを表示する。

import { useSortable } from "@dnd-kit/sortable"
import { SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TreeNode as TreeNodeType, Status } from "../types"
import { useState } from "react"
import { useTreeContext } from "../contexts/TreeContext"
import { useAddNode } from "../contexts/AddNodeContext"
import StepProgress from "./StepProgress"
import NodeRenderer from "./NodeRenderer"
import NodeDetail from "./NodeDetail"

interface Props {
    node: TreeNodeType
}

const statusColor = (status: Status) => {
    switch (status) {
        case "todo": return "border-1 border-black-300"
        case "in_progress": return "bg-green-400"
        case "done": return "bg-gray-500"
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
    const { updateNode, removeNode } = useTreeContext()
    const openAdd = useAddNode()
    const [editing, setEditing] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>(node.title)
    const [detailOpen, setDetailOpen] = useState<boolean>(false)

    const handleStatusClick = async () => {
        await updateNode(node.id, { status: nextStatus(node.status) })
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

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: node.id
    })

    return (
        // DnD: useSortable の setNodeRef を ref に、transform/transition を style に、
        // isDragging のとき opacity-40 を付ける
        <li className={`flex flex-col items-start ${isDragging ? "opacity-40" : ""}`}>
            {/* 背景色とボーダーで phase であることを視覚的に区別 */}
            <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded border-l-4 border-purple-400"
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            >
                {/* DnD ドラッグハンドル: ここに {...attributes} {...listeners} を結線する */}
                <button
                    type="button"
                    className="cursor-grab touch-none select-none text-gray-400 hover:text-gray-600 active:cursor-grabbing px-1"
                    aria-label="ドラッグして並び替え"
                    {...attributes}
                    {...listeners}
                >
                    ⠿
                </button>

                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Phase</span>

                {node.children.length > 0 && (
                    <button type="button" onClick={() => {
                        updateNode(node.id, {collapse: !node.collapse})
                        }}>
                        {node.collapse ? "▶︎" : "▼"}
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
                <button type="button" onClick={() => openAdd(node.id)} className="text-xs ml-2">＋ステップ</button>
                <button type="button" onClick={handleRemove} className="text-xs text-red-500">削除</button>
            </div>

            {detailOpen && <NodeDetail node={node} />}

            {/* 展開時: 上部にプログレスライン、子ステップを番号付き (ol) で並べる */}
            {!node.collapse && node.children.length > 0 && (
                <div className="ml-6 mt-2">
                    <StepProgress steps={node.children} />
                    <SortableContext items={node.children.map(children => children.id)}>
                        <ol className="flex flex-col md:flex-row md:items-start gap-1 md:gap-4 mt-1 md:mt-2">
                            {node.children.map(child => (
                                <NodeRenderer key={child.id} node={child} />
                            ))}
                        </ol>
                    </SortableContext>
                </div>
            )}
        </li>
    )
}
