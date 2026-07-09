import { DndContext, useSensor, useSensors, DragOverlay, PointerSensor, type DragStartEvent, type DragEndEvent, type DragMoveEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useTreeContext } from "../contexts/TreeContext";
import { HideDoneProvider } from "../contexts/HideDoneContext";
import { useDisplayMode } from "../contexts/DisplayModeContext";
import NodeRenderer from "./NodeRenderer";
import { useState } from "react";
import type { TreeNode } from "../types";
import { DropIndicatorProvider } from "../contexts/DropIndicatorContext";

interface Props {
    hideDone: boolean
    rootId: string | null
}

export default function TreeView({hideDone, rootId}: Props) {
    const { tree, loading, reorderNodes, reorderSteps, moveNode } = useTreeContext()
    const { displayMode } = useDisplayMode()
    const [ activeId, setActiveId ] = useState<string | null>(null)
    const [ dropTarget, setDropTarget ] = useState<{ overId: string, position: "before" | "after" | "inside" } | null>(null)

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: {distance: 8} } ))

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(String(active.id))
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setDropTarget(null)
        if (over === null || active.id === over.id || activeId === null) return
        const overId = String(over.id)
        const activeNode = found(tree, activeId)
        const overNode = found(tree, overId)
        if (activeNode === null || overNode === null) return
        const parent = foundParent(tree, activeId)
        const overParent = foundParent(tree, overId)
        const position = getDropPosition(event)
        if (position === "after" || position === "before") {
            if (overNode.id === rootId) return
            const destSiblings = overParent ? overParent.children : tree
            const ids = destSiblings.map(n => n.id).filter(id => id !== activeId)
            const overIndex = ids.indexOf(overId)
            const insertAt = position === "after" ? overIndex + 1 : overIndex
            const orderedIds = ids.toSpliced(insertAt, 0, activeId)
            if (parent === overParent) {
                if (!overParent) {
                    await reorderNodes(null, {orderedIds})
                } else if (overParent.nodeType === "phase") {
                    await reorderSteps(overParent.id, {orderedIds})
                } else if (overParent.nodeType === "task") {
                    await reorderNodes(overParent.id, {orderedIds})
                }
            } else {
                if (found(activeNode.children, overId) !== null) return
                await moveNode(activeId, { parentId: overParent?.id ?? null})
                if (!overParent) {
                    await reorderNodes(null, {orderedIds})
                } else if (overParent.nodeType === "phase") {
                    await reorderSteps(overParent.id, {orderedIds})
                } else if (overParent.nodeType === "task") {
                    await reorderNodes(overParent.id, {orderedIds})
                }
            }
        } else if (position === "inside") {            
            if (found(activeNode.children, overId) !== null) return
            const overChildIds = overNode.children.map(n => n.id).filter(id => id !== activeId)
            const orderedIds = overNode.collapse ? [activeId, ...overChildIds] : [...overChildIds, activeId]
            await moveNode(activeId, { parentId: overId})
            if (overNode.nodeType === "phase") {
                await reorderSteps(overNode.id, {orderedIds})
            } else if (overNode.nodeType === "task") {
                await reorderNodes(overNode.id, {orderedIds})
            }
        }
    }

    const handleDragMove = (event: DragMoveEvent | DragEndEvent ) => {
        if (event.over === null) {
            setDropTarget(null)
            return
        }
        const overId = String(event.over.id)
        if (overId === activeId) { 
            setDropTarget(null)
            return
        }
        setDropTarget({ overId, position: getDropPosition(event)})
    }

    const handleDragCancel = () => {
        setDropTarget(null)
    }

    const found = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node
            const target = found(node.children, id)
            if (target !== null) return target
        }
        return null
    }

    const foundParent = (nodes: TreeNode[], id: string): TreeNode | null => {
        const parentId = found(nodes, id)?.parentId
        return parentId ? found(nodes, parentId) : null
    }
    
    const getDropPosition = (event: DragEndEvent): "before" | "inside" | "after" => {
        if (event.over === null) return "before"
        const overId = String(event.over.id)
        const overNode = found(tree, overId)
        if (overNode === null) return "before"
        const overParent = foundParent(tree, overId)
        const overSiblings = overParent ? overParent.children : tree
        const isLast = overSiblings[overSiblings.length - 1]?.id === overId
        const overRect = event.over.rect
        const activeRect = event.active.rect.current.translated ?? event.active.rect.current.initial
        const isHorizontal = displayMode === "horizontal" && overParent != null && overParent.id !== rootId
        if (activeRect === null) return "before"
        const center = isHorizontal ? activeRect.left + activeRect.width / 2 : activeRect.top + activeRect.height / 2
        const ratio = isHorizontal ? (center - overRect.left) / overRect.width : (center - overRect.top) / overRect.height
        if (overNode.collapse === false && overNode.children.length > 0 && !isLast) {
            return ratio < 1/4 ? "before" : "inside"
        } else {
            if (ratio < 1/4) return "before"
            else if (ratio < 3/4) return "inside"
            else return "after"
        }
    }

    // 選択ルートを丸ごと描画。done の除外は各ノードが表示時に行う(HideDoneProvider 経由)。
    // ツリー自体はフィルタしないので StepProgress 等は全ステップで計算できる。
    const visibleRoot = rootId ? tree.find(n => n.id === rootId) ?? null : null

    if (loading === true) return (
        <div className="text-slate-400">
            <p>Loading...</p>
        </div>
    )

    if (visibleRoot === null) return (
        <div className="text-slate-500 p-8">
            <p>左のルートを選択してください</p>
        </div>
    )

    // ゴーストは掴んだ1行だけ表示する（children を空にして配下サブツリーを描かない）
    const activeNode = activeId ? found(tree, activeId) : null

    return (
        <DndContext sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onDragCancel={handleDragCancel}
        >
            <DropIndicatorProvider value={dropTarget}>
                <HideDoneProvider value={hideDone}>
                    <SortableContext items={[visibleRoot.id]}>
                        <ul>
                            <NodeRenderer node={visibleRoot} depth={0} />
                        </ul>
                    </SortableContext>
                </HideDoneProvider>
            </DropIndicatorProvider>
            <DragOverlay dropAnimation={null}>
                {activeNode ? (
                    <div className="w-fit cursor-grabbing rounded-lg shadow-2xl opacity-90">
                        <NodeRenderer node={{ ...activeNode, children: [] }} depth={1} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}