import { getAll } from "../nodes/nodes.service.js";
import type { TreeNode } from "../nodes/tree.utils.js";

export async function exportJSON(userId: string) {
    const tree = await getAll(userId)
    return tree
}

export async function exportCSV(userId: string) {
    function makeCSV(flatNode: string[], nodes: TreeNode[], parentPath: string) {
        for (const node of nodes) {
            const path = parentPath === "" ? node.title : parentPath + " > " + node.title
            const deadline = node.deadline ? node.deadline.toISOString() : ""
            const line = [path, node.title, node.nodetype, node.status, node.priority, deadline, String(node.step), String(node.sort)].map(escapeCSV).join(",")
            flatNode.push(line)
            makeCSV(flatNode, node.children, path)
        }
        return flatNode
    }
    const tree = await getAll(userId)
    const flatNode: string[] = []
    flatNode.push("path,title,nodetype,status,priority,deadline,step,sort")
    const csvList = makeCSV(flatNode, tree, "")
    const joinCSV = csvList.join("\n")
    return joinCSV
}

const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = value.replaceAll('"', '""')
        return '"' + value + '"'
    }
    return value
}