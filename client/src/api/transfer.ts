import { client } from './client'

export async function getJSON() {
    return await client.get("/export/json", {responseType: 'blob' })
    .then(res => res.data)
}

export async function getCSV() {
    return await client.get("/export/csv", {responseType: 'blob'})
    .then(res => res.data)
}

export async function pushJSON(data: unknown) {
    return await client.post("/import/json", data)
    .then(res => res.data)
}