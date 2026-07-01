// 左サイドバー。ルート(トップレベル)ノードの一覧を表示し、選択でメインに反映する。
// ルートの並び替え(縦 DnD)を持つ。hideDone は適用しない(常に全ルート表示)。

import { DndContext, useSensor, useSensors, PointerSensor, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTreeContext } from "../contexts/TreeContext";
import type { TreeNode } from "../types";

interface Props {
    selectedRootId: string | null;
    onSelect: (id: string) => void;
    open: boolean;
}

function RootItem({ node, selected, onSelect }: { node: TreeNode; selected: boolean; onSelect: (id: string) => void }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: node.id });
    return (
        <li ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            onClick={() => onSelect(node.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${isDragging ? "opacity-50" : ""} ${
                selected ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            <button {...attributes} {...listeners}
                className="cursor-grab touch-none text-slate-500 hover:text-slate-300" aria-label="並び替え">⠿</button>
            <span className="truncate">{node.title}</span>
        </li>
    );
}

export default function Sidebar({ selectedRootId, onSelect, open }: Props) {
    const { tree, reorderNodes } = useTreeContext();
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over === null || active.id === over.id) return;
        const ids = tree.map(n => n.id);
        const ordered = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
        await reorderNodes(null, { orderedIds: ordered });
    };

    return (
        <aside className={`${open ? "block" : "hidden"} md:block w-56 shrink-0 bg-slate-900 p-2 overflow-y-auto`}>
            <h2 className="px-3 py-2 text-xs uppercase tracking-wide text-slate-500">ルート</h2>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={tree.map(n => n.id)} strategy={verticalListSortingStrategy}>
                    <ul className="flex flex-col gap-1">
                        {tree.map(node => (
                            <RootItem key={node.id} node={node} selected={node.id === selectedRootId} onSelect={onSelect} />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </aside>
    );
}
