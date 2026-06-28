import { client, setAccessToken } from './client.js'

export async function login(email: string, password: string) {
    return await client.post("/auth/login", {email: email, password: password})
    .then(res => {
        setAccessToken(res.data.accessToken)
        console.log(res.data)
    })
}

export async function register(email: string, username: string, password: string) {
    return await client.post("/auth/register", {email: email, name: username, password: password})
    .then(res => {
        setAccessToken(res.data.accessToken)
    })
}

export async function logout() {
    return await client.post("/auth/logout")
    .then(() =>{setAccessToken(null)}
        
    )
}

export async function getMe() {
    return await client.get("/auth/me")
    .then(res => {
        return res.data
    })
}