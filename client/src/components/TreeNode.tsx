// task ノードを描画するコンポーネント。
// ステータス循環、タイトルインライン編集、子追加・削除ボタンを持つ。

import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { TreeNode as TreeNodeType } from "../types"
import { useState } from "react"
import { useTreeContext } from "../contexts/TreeContext"
import { useAddNode } from "../contexts/AddNodeContext"
import { subtreeUrgency, deadlineColor, statusColor, priorityColor } from "../utils/nodeStatus"
import { useStatusCycle } from "../hooks/useStatusCycle"
import { useDisplayMode } from "../contexts/DisplayModeContext"
import { useHideDone } from "../contexts/HideDoneContext"
import { useDropIndicator } from "../contexts/DropIndicatorContext"
import { DropLine } from "./DropLine"
import { HorizontalChildren } from "./HorizontalChildren"
import NodeRenderer from "./NodeRenderer"
import NodeDetail from "./NodeDetail"

interface Props {
    node: TreeNodeType
    depth: number
    headerOnly?: boolean
    onToggle?: () => void
    isOpen?: boolean
}

export default function TreeNode({ node, depth, headerOnly, onToggle, isOpen }: Props) {
    const { updateNode, removeNode } = useTreeContext()
    const openAdd = useAddNode()
    const [editing, setEditing] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>(node.title)
    const [detailOpen, setDetailOpen] = useState<boolean>(false)
    // ステータスドットの判定・強制手段(Shift+クリック / 長押し)は useStatusCycle に集約
    const { denied, pressing, dotHandlers } = useStatusCycle(node)

    const { displayMode } = useDisplayMode()

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

    const dropTarget = useDropIndicator()
    const dropPos = dropTarget?.overId === node.id ? dropTarget.position : null

    const toggle = onToggle ?? (() => updateNode(node.id, { collapse: !node.collapse }))

    const handleAdd = () => {
        if (headerOnly ? !isOpen : node.collapse) toggle()
        openAdd(node.id)
    }

    return (
        // DnD: useSortable の setNodeRef を ref に、transform/transition を style に、
        // isDragging のとき opacity-40 を付ける
        <li className={`flex flex-col items-start ${isDragging ? "opacity-40" : ""}`}>
            <div ref={setNodeRef}
            className={`relative ${headerOnly ? "w-64" : "max-w-xs"} rounded bg-slate-800 text-slate-100 hover:bg-slate-700 ${denied ? "ring-2 ring-red-500 " : dropPos === "inside" ? "ring-2 ring-sky-400 " : ""}${node.children.length > 0 && !node.collapse ? "border-2 border-sky-600" : "border border-slate-700"}`}
            >
                {dropPos === "before" && <DropLine edge="before" depth={depth} />}
                {dropPos === "after" && <DropLine edge="after" depth={depth} />}
                {/* 上段: ハンドル・ステータス・タイトル。クリックで展開/折りたたみ */}
                <div
                    className={`flex min-w-0 items-center gap-2 px-2 py-1 ${node.children.length > 0 ? "cursor-pointer" : ""}`}
                    onClick={() => { if (node.children.length > 0) toggle() }}
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

                    {/* ステータスドット: クリックで状態を循環（展開はしない） */}
                    <span className="relative inline-flex shrink-0 items-center justify-center">
                        {pressing && (
                            <span
                                aria-hidden="true"
                                className="force-ring pointer-events-none absolute h-3 w-3 rounded-full ring-2 ring-sky-400"
                            />
                        )}
                        <button
                            type="button"
                            className={`inline-block h-3 w-3 touch-none select-none rounded-full ${dotColor}`}
                            aria-label="status"
                            {...dotHandlers}
                        />
                    </span>

                    {editing ? (
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.nativeEvent.isComposing) saveTitle()
                                if (e.key === "Escape") cancelTitle()
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="bg-slate-700 text-slate-100 border border-slate-600 rounded px-1"
                        />
                    ) : (
                        <span className={`min-w-0 truncate ${node.title ? "" : "text-slate-500"}`} onDoubleClick={() => { setDraft(node.title); setEditing(true) }}>{node.title || "無題"}</span>
                    )}
                    {node.deadline && (
                        <span className={`shrink-0 text-xs ${deadlineColor(node)}`}>{node.deadline.slice(5, 7)}/{node.deadline.slice(8, 10)}</span>
                    )}
                    {node.children.length > 0 && node.collapse && (
                        <span className="shrink-0 rounded-full bg-slate-600 px-1.5 text-[10px] leading-4 text-slate-200">{node.children.length}</span>
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
                    <button type="button" onClick={handleAdd} className="text-xs">＋</button>
                    {depth !== 0 && (
                        <button type="button" onClick={handleRemove} className="text-xs text-red-400">－</button>
                    )}
                </div>

                {detailOpen && <NodeDetail node={node} />}
            </div>


            {!headerOnly && !node.collapse && node.children.length > 0 && (
                depth === 0 || displayMode !== "horizontal" ? (
                    <SortableContext items={visibleChildren.map(children => children.id)} strategy={verticalListSortingStrategy}>
                        <ul className="flex flex-col gap-1 ml-4 mt-1">
                            {visibleChildren.map(child => (
                                <NodeRenderer key={child.id} node={child} depth={depth + 1} />
                            ))}
                        </ul>
                    </SortableContext>
                ) : (
                    <HorizontalChildren nodes={node.children} depth={depth + 1} />
                )
            )}
        </li>
    )
}
