import 'fastify'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt.js'
import { UnauthorizedError } from '../utils/errors.js'

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            userId: string
        }
    }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.replace("Bearer ", "")
    if (!token) {
        throw new UnauthorizedError()
    }
    try {
        const user = verifyToken(token)
        if (typeof user === "object" && typeof user.userId === "string") {
            request.user = { userId: user.userId }
        } else throw new UnauthorizedError()
    } catch {
        throw new UnauthorizedError()
    }
    
}