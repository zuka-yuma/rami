import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
// import { UnauthorizedError } from '../../utils/errors.js'
// import { isProduction } from '../../config.js'
import { authenticate } from '../../plugins/authenticate.js'

export const exportRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/ping', { preHandler: [authenticate]},
        (request, reply) => {
            reply.status(200).send({ ok: true })
        }
    )
}