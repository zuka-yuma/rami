import type { Node } from '../../generated/prisma/index.js'

export type TreeNode = Node & { children: TreeNode[] }

export function buildTree(flatNodes:Node[]) {
    function sortChildren(nodes: TreeNode[], parentType: string) { 
        if (parentType === 'phase') {
            nodes.sort((a, b) => a.step - b.step)
        } else if (parentType === 'task') {
            nodes.sort((a, b) => a.sort - b.sort)
        }
        for (const node of nodes) {
            sortChildren(node.children, node.nodetype)
        }
    }

    const nodemap = new Map<string, TreeNode>()
    const roots:TreeNode[] = []
    for (const flatNode of flatNodes) {
        const treeNode:TreeNode = {...flatNode, children: [] as TreeNode[]}
        nodemap.set(flatNode.id, treeNode)
    }
    for (const flatNode of flatNodes) {
        const node:TreeNode | undefined = nodemap.get(flatNode.id)
        if (node !== undefined) {
            if (flatNode.parentId === null) {
                roots.push(node)
            } else {
                const parentNode:TreeNode | undefined = nodemap.get(flatNode.parentId)
                if (parentNode !== undefined) {
                    parentNode.children.push(node)
                }
            }
        }
    }
    sortChildren(roots, 'task')
    return roots
}

export function flattenTree(tree:TreeNode[]) {
    function pickNodes(tree:TreeNode[], flattenNode:Node[]) {
        for (const node of tree) {
            const { children, ...restNode } = node
            flattenNode.push(restNode)
            pickNodes(node.children, flattenNode)
        }
    }
    const flattenNode:Node[] = []
    pickNodes(tree, flattenNode)
    return flattenNode
}

export function countStats(nodes:Node[]) {
    const total:number = nodes.length
    let done:number = 0;
    for (const node of nodes) {
        if (node.status === 'done') {
            done++
        }
    }
    return { total: total, done: done }
}