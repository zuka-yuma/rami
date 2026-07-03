// ノードの nodetype に応じて TreeNode か PhaseNode を出し分けるディスパッチャ。
// ツリー描画の children map で毎回分岐を書く重複を防ぐ。

import type { TreeNode as TreeNodeType } from "../types"
import TreeNode from "./TreeNode"
import PhaseNode from "./PhaseNode"

interface Props {
    node: TreeNodeType
    depth: number
    // 横並び層ではカードのみ描画（子は親側の HorizontalChildren が下に描く）
    headerOnly?: boolean
    // collapse トグルの差し替え（アコーディオン用）。無ければ通常のトグル
    onToggle?: () => void
}

export default function NodeRenderer({ node, depth, headerOnly, onToggle }: Props) {
    if (node.nodetype === "phase") {
        return <PhaseNode node={node} depth={depth} headerOnly={headerOnly} onToggle={onToggle} />
    }
    return <TreeNode node={node} depth={depth} headerOnly={headerOnly} onToggle={onToggle} />
}
