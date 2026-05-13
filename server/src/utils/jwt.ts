import jwt from 'jsonwebtoken'
import { config } from '../config.js'



export function generateAccessToken(userId: string) {
    const payload = {userId:userId}
    const accessToken = jwt.sign(payload, config.jwt.secret, config.jwt.access)
    return accessToken
}

export function generateRefreshToken(userId: string) {
    const payload = {userId:userId}
    const refreshToken = jwt.sign(payload, config.jwt.secret,config.jwt.refresh)
    return refreshToken
}

export function verifyToken(token: string) {
    try {
        const user = jwt.verify(token, config.jwt.secret)
        return user
    } catch (error) {
        throw error
    }
}