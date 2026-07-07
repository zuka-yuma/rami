import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
// import { UnauthorizedError } from '../../utils/errors.js'
// import { isProduction } from '../../config.js'
import { authenticate } from '../../plugins/authenticate.js'
import { exportCSV, exportJSON } from './export.service.js'

export const exportRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/json', { preHandler: [authenticate] },
        async (request, reply) => {
            const userId = request.user.userId
            reply.header('Content-Disposition', 'attachment; filename="rami.json"')
            const json = await exportJSON(userId)
            reply.status(200).send(json)
        }
    )

    fastify.get('/csv', { preHandler: [authenticate]},
        async (request, reply) => {
            const userId = request.user.userId
            reply.header('Content-Disposition', 'attachment; filename="rami.csv"')
            reply.type('text/csv')
            const csv = await exportCSV(userId)
            reply.status(200).send(csv)
        }
    )
}