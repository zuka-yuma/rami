import { useState, useEffect } from "react"
import type { TreeNode, CreateNodeInput, UpdateNodeInput, MoveNodeInput, ToggleTypeInput } from "../types"
import { useAuth } from "../contexts/AuthContext"
import { create, getAll, update, remove, move, toggleType } from "../api/nodes"
import { addSteps as apiAddSteps, reorderSteps as apiReorderSteps, reorderNodes as apiReorderNodes} from "../api/nodes"
import type { AddStepsInput, ReorderInput } from "../types"

export function useTree() {
    const { user } = useAuth()
    const [tree, setTree] = useState<TreeNode[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!user) return
        getAll()
        .then(data => setTree(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }, [user])

    const refetch = async () => { setTree(await getAll()) }

    const rebuildTree = (children: TreeNode[], parentId: string, orderedIds: string[]) => {
        return children.map((child) => {
            if (child.id === parentId) {
                return {...child, children: orderedIds.map(id => child.children.find(c => c.id === id)) as TreeNode[]}
            } else {
                return {...child, children: rebuildTree(child.children, parentId, orderedIds)}
            }
        })
    }

    const removeFromTree = (children: TreeNode[], targetId: string) => {
        return children.filter(c => c.id !== targetId).map(c => ({ ...c, children: removeFromTree(c.children,targetId) }))
    }

    const insertIntoTree = (children: TreeNode[], parentId: string, node: TreeNode) => {
        return children.map(child =>
            child.id === parentId ? { ...child, children: [...child.children, node] } : { ...child, children: insertIntoTree(child.children, parentId, node)}
        )
    }

    const updateTree = (children: TreeNode[], id: string, node: TreeNode) => {
        return children.map(child =>
            child.id === id ? {...node} : { ...child, children: updateTree(child.children, id, node)}
        )
    }

    const found = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node
            const target = found(node.children, id)
            if (target !== null) return target
        }
        return null
    }
    
    async function addNode(input: CreateNodeInput) {
        await create(input)
        await refetch()
    }

    async function updateNode(id: string, input: UpdateNodeInput) {
        const node = {...found(tree, id), ...input}
        setTree(prev => updateTree(prev, id, node))
        await update(id, input)
        await refetch()
    }

    async function removeNode(id: string) {
        await remove(id)
        await refetch()
    }

    async function moveNode(id: string, input: MoveNodeInput) {
        const node = {...found(tree, id), parentId: input.parentId}
        setTree(prev => {
            const removedPrev = removeFromTree(prev, id)
            return input.parentId === null ? [...removedPrev, node] : insertIntoTree(removedPrev, input.parentId, node)
        })
        await move(id, input)
        await refetch()
    }

    async function toggleNodeType(id: string, input: ToggleTypeInput) {
        await toggleType(id, input)
        await refetch()
    }

    async function addSteps(parentId: string, input: AddStepsInput) {
        await apiAddSteps(parentId, input)
        await refetch()
    }

    async function reorderSteps(parentId: string | null, input: ReorderInput) {
        if (parentId === null) {
            setTree(prev => input.orderedIds.map(id => prev.find(n => n.id === id)) as TreeNode[])
        } else {
            setTree(prev => rebuildTree(prev, parentId, input.orderedIds) as TreeNode[])
        }
        await apiReorderSteps(parentId, input)
        await refetch()
    }

    async function reorderNodes(parentId: string | null, input: ReorderInput) {
        if (parentId === null) {
            setTree(prev => input.orderedIds.map(id => prev.find(n => n.id === id)) as TreeNode[])
        } else {
            setTree(prev => rebuildTree(prev, parentId, input.orderedIds) as TreeNode[])
        }
        await apiReorderNodes(parentId, input)
        await refetch()
    }
    
    return { tree, loading, addNode, updateNode, removeNode, moveNode, toggleNodeType, addSteps, reorderSteps, reorderNodes }
}

