// task ノードを描画するコンポーネント。
// ステータス循環、タイトルインライン編集、子追加・削除ボタンを持つ。

import { useSortable } from "@dnd-kit/sortable"
import { SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TreeNode as TreeNodeType, Status } from "../types"
import { useState } from "react"
import { useTreeContext } from "../contexts/TreeContext"
import NodeRenderer from "./NodeRenderer"
import NodeDetail from "./NodeDetail"

interface Props {
    node: TreeNodeType
}

const statusColor = (status: Status) => {
    switch (status) {
        case "todo": return "border-1 border-black-300"
        case "in_progress": return "bg-green-400"
        case "done": return "bg-gray-600"
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

export default function TreeNode({ node }: Props) {
    const { addNode, updateNode, removeNode } = useTreeContext()
    const [editing, setEditing] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>(node.title)
    const [detailOpen, setDetailOpen] = useState<boolean>(false)

    const handleStatusClick = async () => {
        await updateNode(node.id, { status: nextStatus(node.status)})
    }

    const handleAddChild = async () => {
        const title = window.prompt("子ノードのタイトル")
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
        <li className={`my-1 ${isDragging ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-2"
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

                {node.children.length > 0 && (
                    <button type="button" onClick={() => {
                        updateNode(node.id, {collapse: !node.collapse})
                        }}>
                        {node.collapse ? "▶︎" : "▼"}
                    </button>
                )}

                {/* ステータスドット: <button> でラップしてクリックで循環できるようにする */}
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
                <button type="button" onClick={handleAddChild} className="text-xs ml-2">＋子</button>
                <button type="button" onClick={handleRemove} className="text-xs text-red-500">削除</button>
            </div>

            {detailOpen && <NodeDetail node={node} />}

            {!node.collapse && node.children.length > 0 && (
                <SortableContext items={node.children.map(children => children.id)}>
                    <ul className="ml-4">
                        {node.children.map(child => (
                            <NodeRenderer key={child.id} node={child} />
                        ))}
                    </ul>
                </SortableContext>
            )}
        </li>
    )
}
