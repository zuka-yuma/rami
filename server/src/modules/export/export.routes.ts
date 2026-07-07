import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
// import { UnauthorizedError } from '../../utils/errors.js'
// import { isProduction } from '../../config.js'
import { authenticate } from '../../plugins/authenticate.js'
import { exportJSON } from './export.service.js'

export const exportRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/json', { preHandler: [authenticate] },
        async (request, reply) => {
            const userId = request.user.userId
            reply.header('Content-Disposition', 'attachment; filename="rami.json"')
            const tree = await exportJSON(userId)
            reply.status(200).send(tree)
        }
    )
}