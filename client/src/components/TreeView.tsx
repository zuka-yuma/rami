import { useTreeContext } from "../contexts/TreeContext";
import NodeRenderer from "./NodeRenderer";

export default function TreeView() {
    const { tree, loading } = useTreeContext()

    if (loading === true) return (
        <div>
            <p>Loading...</p>
        </div>
    )

    if (tree.length === 0) return (
        <div>
            <p>ノードがありません</p>
        </div>
    )

    return (
        <ul>
            {tree.map(node => (
                <NodeRenderer key={node.id} node={node} />
            ))}
        </ul>
    )
}