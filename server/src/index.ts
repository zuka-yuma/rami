import fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { config } from './config.js'
import { AppError } from './utils/errors.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { nodesRoutes } from './modules/nodes/nodes.routes.js'
import { exportRoutes } from './modules/export/export.routes.js'

const server = fastify().withTypeProvider<TypeBoxTypeProvider>()

server.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        reply.status(error.statuscode).send({ status:error.message, timeStamp: Date.now()})
    } else {
        reply.status(500).send({ status: "Server Error", timeStamp: Date.now()})
    }
})

server.register(cors, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
})

server.register(cookie, {
    secret: config.jwt.secret
})

server.register(authRoutes, {
    prefix: '/api/auth'
})

server.register(nodesRoutes, {
    prefix: '/api/nodes'
})

server.register(exportRoutes, {
    prefix: '/api/export'
})

server.get('/api/health', async (request, reply) => {
    reply.status(200).send({ status:"ok", timeStamp: Date.now()})
})

server.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err
    server.log.info(`server listening on ${address}`)
})