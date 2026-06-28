// ノードの nodetype に応じて TreeNode か PhaseNode を出し分けるディスパッチャ。
// ツリー描画の children map で毎回分岐を書く重複を防ぐ。

import type { TreeNode as TreeNodeType } from "../types"
import TreeNode from "./TreeNode"
import PhaseNode from "./PhaseNode"

interface Props {
    node: TreeNodeType
}

export default function NodeRenderer({ node }: Props) {
    if (node.nodetype === "phase") {
        return <PhaseNode node={node} />
    }
    return <TreeNode node={node} />
}
