import fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { config } from './config.js'
import { AppError } from './utils/errors.js'

const server = fastify()

server.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        reply.status(error.statuscode).send({ status:error.message, timeStamp: Date.now()})
    } else {
        reply.status(500).send({ status:"Server Error", timeStamp: Date.now()})
    }
})

server.register(cors, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
})

server.register(cookie, {
    secret: config.jwt.secret
})

server.get('/api/health', async (request, reply) => {
    reply.status(200).send({ status:"ok", timeStamp: Date.now()})
})

server.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err
    server.log.info(`server listening on ${address}`)
})