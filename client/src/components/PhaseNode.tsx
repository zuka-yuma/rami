// phase ノードを描画するコンポーネント。
// TreeNode の phase 版。展開時に StepProgress（進捗ライン）と
// 番号付きの子ステップを表示する。

import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TreeNode as TreeNodeType, Status } from "../types"
import { useState } from "react"
import { useTreeContext } from "../contexts/TreeContext"
import { useAddNode } from "../contexts/AddNodeContext"
import { subtreeUrgency } from "../utils/nodeStatus"
import { useHideDone } from "../contexts/HideDoneContext"
import StepProgress from "./StepProgress"
import NodeRenderer from "./NodeRenderer"
import NodeDetail from "./NodeDetail"

interface Props {
    node: TreeNodeType
    depth: number
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

export default function PhaseNode({ node, depth }: Props) {
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

    const urgency = subtreeUrgency(node)
    const dotColor = urgency === "delay" ? "bg-orange-500"
        : urgency === "overdue" ? "bg-red-500"
        : statusColor(urgency)

    const hideDone = useHideDone()
    const visibleChildren = hideDone ? node.children.filter(c => c.status !== "done") : node.children

    return (
        // DnD: useSortable の setNodeRef を ref に、transform/transition を style に、
        // isDragging のとき opacity-40 を付ける
        <li className={`flex flex-col items-start ${isDragging ? "opacity-40" : ""}`}>
            {/* phase は紫アクセント。子ありは sky の枠で展開可能を示す */}
            <div ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`rounded bg-purple-900/40 text-slate-100 hover:bg-purple-900/60 ${node.children.length > 0 && !node.collapse ? "border-2 border-sky-600 border-l-4 border-l-purple-400" : "border border-slate-700 border-l-4 border-l-purple-400"}`}
            >
                {/* 上段: ハンドル・Phaseバッジ・ステータス・タイトル。クリックで展開/折りたたみ */}
                <div
                    className={`flex items-center gap-2 px-2 py-1 ${node.children.length > 0 ? "cursor-pointer" : ""}`}
                    onClick={() => { if (node.children.length > 0) updateNode(node.id, { collapse: !node.collapse }) }}
                >
                    <button
                        type="button"
                        className="cursor-grab touch-none select-none text-slate-500 hover:text-slate-300 active:cursor-grabbing px-1"
                        aria-label="ドラッグして並び替え"
                        onClick={(e) => e.stopPropagation()}
                        {...attributes}
                        {...listeners}
                    >
                        ⠿
                    </button>

                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Phase</span>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleStatusClick() }}
                        className={`inline-block w-3 h-3 rounded-full ${dotColor}`}
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
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="bg-slate-700 text-slate-100 border border-slate-600 rounded px-1"
                        />
                    ) : (
                        <span onDoubleClick={() => setEditing(true)}>{node.title}</span>
                    )}
                </div>

                {/* 下段: 優先度・詳細・追加・削除 */}
                <div className="flex items-center gap-2 px-2 pb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColor(node.priority)}`}>
                        {node.priority}
                    </span>
                    <button type="button" onClick={() => setDetailOpen(!detailOpen)} className="text-xs">
                        {detailOpen ? "詳細▲" : "詳細▼"}
                    </button>
                    <button type="button" onClick={() => openAdd(node.id)} className="text-xs">＋</button>
                    {depth !== 0 && (
                        <button type="button" onClick={handleRemove} className="text-xs text-red-400">－</button>
                    )}
                </div>
            </div>

            {detailOpen && <NodeDetail node={node} />}

            {/* 展開時: 上部にプログレスライン、子ステップを番号付き (ol) で並べる */}
            {!node.collapse && node.children.length > 0 && (
                <div className="ml-6 mt-2">
                    <StepProgress steps={node.children} />
                    <SortableContext items={visibleChildren.map(children => children.id)} strategy={depth === 0 ? verticalListSortingStrategy : undefined}>
                        <ol className={depth === 0
                            ? "flex flex-col gap-1 mt-2"
                            : "flex flex-col md:flex-row md:items-start gap-1 md:gap-4 mt-1 md:mt-2"}>
                            {visibleChildren.map(child => (
                                <NodeRenderer key={child.id} node={child} depth={depth + 1} />
                            ))}
                        </ol>
                    </SortableContext>
                </div>
            )}
        </li>
    )
}
