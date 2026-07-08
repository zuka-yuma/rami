import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../plugins/authenticate.js'
import { importJSON } from './import.service.js'
import { importSchema, type importSchemaType } from './import.schema.js'

export const importRoutes = async (fastify: FastifyInstance) => {
    fastify.post<{ Body: importSchemaType }>('/json',
        { preHandler: [authenticate], schema: { body: importSchema } },
        async (request, reply) => {
            const userId = request.user.userId
            await importJSON(userId, request.body)
            reply.status(204).send()
        }
    )
}
