import { register, login, refresh, logout } from './auth.service.js'
import type { registerSchemaType, loginSchemaType } from './auth.schema.js'
import { registerSchema, loginSchema } from './auth.schema.js'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { UnauthorizedError } from '../../utils/errors.js'
import { isProduction } from '../../config.js'

export const authRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.post<{ Body: registerSchemaType}>('/register', { schema: { body: registerSchema }}, 
        async (request, reply) => {
            const { email, name, password } = request.body
            const tokens = await register(email, name, password)
            reply.setCookie('token', tokens.rtoken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict'
            })
            reply.status(201).send({ accessToken: tokens.atoken })
        }
    )

    fastify.post<{ Body: loginSchemaType}>('/login', { schema: { body: loginSchema }}, 
        async (request, reply) => {
            const { email, password } = request.body
            const tokens: { atoken: string, rtoken: string} = await login(email, password)
            reply.setCookie('token', tokens.rtoken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'strict'
            })
            reply.status(200).send({ accessToken: tokens.atoken })
        }
    )

    fastify.post('/refresh', 
        async (request, reply) => {
            const rtoken = request.cookies.token
            if (!rtoken) throw new UnauthorizedError()
            const atoken = await refresh(rtoken)
            reply.status(200).send({ accessToken: atoken })
        }
    )

    fastify.post('/logout', 
        async (request,reply) => {
            const rtoken = request.cookies.token
            if (!rtoken) throw new UnauthorizedError()
            await logout(rtoken)
            reply.status(204).send()
        }
    )
}