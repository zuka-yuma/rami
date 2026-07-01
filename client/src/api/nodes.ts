import { client } from "./client";
import type { AddStepsInput, MoveNodeInput, Node, ReorderInput, ToggleTypeInput, TreeNode } from "../types"
import type { CreateNodeInput, UpdateNodeInput} from "../types";


export async function getAll() {
    return await client.get<TreeNode[]>("/nodes")
    .then(res => res.data)
}

export async function create(body: CreateNodeInput) {
    return await client.post<Node>("/nodes", body)
    .then(res => res.data)
}

export async function update(id: string, body: UpdateNodeInput) {
    return await client.patch<Node>(`/nodes/${id}`, body)
    .then(res => res.data)
}

export async function remove(id: string) {
    return await client.delete(`/nodes/${id}`)
}

export async function move(id: string, body: MoveNodeInput) {
    return await client.patch(`/nodes/${id}/move`, body)
}

export async function toggleType(id: string, body: ToggleTypeInput) {
    return await client.patch(`/nodes/${id}/toggle-type`, body)
}

export async function addSteps(parentId: string, body: AddStepsInput) {
    return await client.post<Node[]>(`/nodes/${parentId}/steps`, body)
    .then(res => res.data)
}

export async function reorderSteps(parentId: string | null, body: ReorderInput) {
    return await client.patch(`/nodes/${parentId}/reorder-steps`, body)
}

export async function reorderNodes(parentId: string | null, body: ReorderInput) {
    return await client.post(`/nodes/${parentId}/reorder-nodes`, body)
}