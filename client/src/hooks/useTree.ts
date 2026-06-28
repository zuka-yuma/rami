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
    
    async function addNode(input: CreateNodeInput) {
        await create(input)
        await refetch()
    }

    async function updateNode(id: string, input: UpdateNodeInput) {
        await update(id, input)
        await refetch()
    }

    async function removeNode(id: string) {
        await remove(id)
        await refetch()
    }

    async function moveNode(id: string, input: MoveNodeInput) {
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

    async function reorderSteps(parentId: string, input: ReorderInput) {
        await apiReorderSteps(parentId, input)
        await refetch()
    }

    async function reorderNodes(parentId: string, input: ReorderInput) {
        await apiReorderNodes(parentId, input)
        await refetch()
    }
    
    return { tree, loading, addNode, updateNode, removeNode, moveNode, toggleNodeType, addSteps, reorderSteps, reorderNodes }
}

