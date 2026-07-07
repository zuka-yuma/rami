import { getAll } from "../nodes/nodes.service.js";

export async function exportJSON(userId: string) {
    const tree = await getAll(userId)
    return tree
}
