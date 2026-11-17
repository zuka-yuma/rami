import type { FastifyInstance } from "fastify";
import { authenticate } from "../../plugins/authenticate.js"
import { issueApiToken, listApiTokens, revokeApiToken } from "../auth/apiToken.service.js";
import { issueApiTokenSchema, type issueApiTokenSchemaType } from "./tokens.schema.js";

export const tokensRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: issueApiTokenSchemaType }>('',
    { preHandler: [authenticate] , schema: { body: issueApiTokenSchema } },
    async (request, reply) => {
      const userId = request.user.userId
      const token = await issueApiToken(userId, request.body.name)
      reply.status(201).send({token})
    })

  fastify.get('',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.userId
      const apiTokens = await listApiTokens(userId)
      reply.status(200).send(apiTokens)
    })

  fastify.post<{ Params: { id: string } }>('/:id/revoke',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.userId
      const id = request.params.id
      const updatesCount = await revokeApiToken(userId, id)
      if (updatesCount === 0) {
        reply.status(404).send()
      } else {
        reply.status(204).send()
      }
    })
}
