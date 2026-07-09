// 横並び層(depth>=2)の描画。
// 子を「ヘッダーの行」で横に並べ、開いている1つ(collapse=false)の子の中身を
// 下に全幅で再帰表示する（アコーディオン）。行は固定幅なので右にずれない。

import { SortableContext } from "@dnd-kit/sortable";
import type { TreeNode } from "../types";
import { useTreeContext } from "../contexts/TreeContext";
import { useHideDone } from "../contexts/HideDoneContext";
import StepProgress from "./StepProgress";
import NodeRenderer from "./NodeRenderer";

interface Props {
    nodes: TreeNode[];
    depth: number;
}

export function HorizontalChildren({ nodes, depth }: Props) {
    const { updateNode } = useTreeContext();
    const hideDone = useHideDone();
    const visible = hideDone ? nodes.filter(n => n.status !== "done") : nodes;
    // アコーディオン: 開いているのは1つだけ(先頭の collapse=false)
    const open = visible.find(n => !n.collapse) ?? null;
    const openIndex = open ? visible.findIndex(n => n.id === open.id) : 0;
    // カード幅 w-64(16rem) + gap-4(1rem) = 17rem。開いてる子の位置に子パネルを寄せる。
    const ITEM_REM = 17;

    // 展開する時は同じ親の他を畳む(1つだけ開く)
    const handleToggle = (target: TreeNode) => {
        if (target.id === open?.id) {
            updateNode(target.id, { collapse: true });
        } else {
            nodes.forEach(n => {
                if (n.id === target.id) updateNode(n.id, { collapse: false });
                else if (!n.collapse) updateNode(n.id, { collapse: true });
            });
        }
    };

    return (
        <div className="ml-6 mt-2">
            <SortableContext items={visible.map(n => n.id)}>
                <ul className="flex flex-row items-start gap-4">
                    {visible.map(n => (
                        <NodeRenderer key={n.id} node={n} depth={depth} headerOnly onToggle={() => handleToggle(n)} isOpen={n.id === open?.id} />
                    ))}
                </ul>
            </SortableContext>
            {open && open.children.length > 0 && (
                <div style={{ marginLeft: `${openIndex * ITEM_REM}rem` }}>
                    {open.nodeType === "phase" && <StepProgress steps={open.children} />}
                    <HorizontalChildren nodes={open.children} depth={depth + 1} />
                </div>
            )}
        </div>
    );
}
