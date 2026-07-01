import { DndContext, useSensor, useSensors, DragOverlay, PointerSensor, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useTreeContext } from "../contexts/TreeContext";
import NodeRenderer from "./NodeRenderer";
import { useState } from "react";
import type { TreeNode } from "../types";

interface Props {
    hideDone: boolean
    rootId: string | null
}

export default function TreeView({hideDone, rootId}: Props) {
    const { tree, loading, reorderNodes, reorderSteps, moveNode } = useTreeContext()
    const [ activeId, setActiveId ] = useState<string | null>(null)

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: {distance: 8} } ))

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(String(active.id))
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        if (over === null || active.id === over.id || activeId === null) return
        const overId = String(over.id)
        const activeNode = found(tree, activeId)
        const overNode = found(tree, overId)
        if (activeNode === null || overNode === null) return
        const parent = foundParent(tree, activeId)
        const overParent = foundParent(tree, overId)
        const position = getDropPosition(event)
        if (position === "after" || position === "before") {
            const destSiblings = overParent ? overParent.children : tree
            const ids = destSiblings.map(n => n.id).filter(id => id !== activeId)
            const overIndex = ids.indexOf(overId)
            const insertAt = position === "after" ? overIndex + 1 : overIndex
            const orderedIds = ids.toSpliced(insertAt, 0, activeId)
            if (parent === overParent) {
                if (!overParent) {
                    await reorderNodes(null, {orderedIds})
                } else if (overParent.nodetype === "phase") {
                    await reorderSteps(overParent.id, {orderedIds})
                } else if (overParent.nodetype === "task") {
                    await reorderNodes(overParent.id, {orderedIds})
                }
            } else {
                if (found(activeNode.children, overId) !== null) return
                await moveNode(activeId, { parentId: overParent?.id ?? null})
                if (!overParent) {
                    await reorderNodes(null, {orderedIds})
                } else if (overParent.nodetype === "phase") {
                    await reorderSteps(overParent.id, {orderedIds})
                } else if (overParent.nodetype === "task") {
                    await reorderNodes(overParent.id, {orderedIds})
                }
            }
        } else if (position === "inside") {
            if (found(activeNode.children, overId) !== null) return
            const overChildIds = overNode.children.map(n => n.id).filter(id => id !== activeId)
            const orderedIds = overNode.collapse ? [activeId, ...overChildIds] : [...overChildIds, activeId]
            await moveNode(activeId, { parentId: overId})
            if (overNode.nodetype === "phase") {
                await reorderSteps(overNode.id, {orderedIds})
            } else if (overNode.nodetype === "task") {
                await reorderNodes(overNode.id, {orderedIds})
            }
        }
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
        if (activeRect === null) return "before"
        const center = activeRect.top + activeRect.height / 2
        const ratio = (center - overRect.top) / overRect.height
        if (overNode.collapse === false && overNode.children.length > 0 && !isLast) {
            return ratio < 1/4 ? "before" : "inside"
        } else {
            if (ratio < 1/4) return "before"
            else if (ratio < 3/4) return "inside"
            else return "after"
        }
    }

    const filterDone = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.filter(n => n.status !== "done").map(n => ({ ...n, children: filterDone(n.children) }))
    }

    const rootNode = rootId ? tree.find(n => n.id === rootId) ?? null : null
    // 選択ルートの配下だけ描画。hideDone は配下(children)に適用し、ルート自身は常に表示。
    const visibleRoot = rootNode
        ? { ...rootNode, children: hideDone ? filterDone(rootNode.children) : rootNode.children }
        : null

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
        >
            <SortableContext items={[visibleRoot.id]}>
                <ul>
                    <NodeRenderer node={visibleRoot} />
                </ul>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
                {activeNode ? (
                    <div className="cursor-grabbing rounded-lg bg-white shadow-2xl ring-1 ring-black/5 opacity-90">
                        <NodeRenderer node={{ ...activeNode, children: [] }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}