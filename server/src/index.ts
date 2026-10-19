import fastify from 'fastify'
import type { FastifyError } from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { config } from './config.js'
import { AppError } from './utils/errors.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { nodesRoutes } from './modules/nodes/nodes.routes.js'
import { exportRoutes } from './modules/export/export.routes.js'
import { importRoutes } from './modules/import/import.routes.js'
import * as Sentry from "@sentry/node"
import { mcpRoutes } from './mcp/mcp.routes.js'

const server = fastify().withTypeProvider<TypeBoxTypeProvider>()

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
})

server.setErrorHandler((error: FastifyError, request, reply) => {
  if (error instanceof AppError) {
    reply.status(error.statuscode).send({ status: error.message, timeStamp: Date.now() })
  } else if (error.statusCode !== undefined) {
    reply.status(error.statusCode).send({ status: error.message, timeStamp: Date.now() })
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

server.register(importRoutes, {
    prefix: '/api/import'
})

// 既定は緩め。厳しくしたいルート（/mcp など）が config.rateLimit で個別に上書きする。
// mcpRoutes より前に登録すること（onRoute フックは後から追加されたルートにしか発火しない）
server.register(rateLimit, {})

server.register(mcpRoutes, {})

server.get('/api/health', async (request, reply) => {
    reply.status(200).send({ status:"ok", timeStamp: Date.now()})
})

server.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err
    server.log.info(`server listening on ${address}`)
})
