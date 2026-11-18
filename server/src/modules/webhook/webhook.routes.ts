import type { FastifyInstance } from "fastify";
import { authenticateWebhook } from "../../plugins/authenticateWebhook.js";
import { createNode } from "../nodes/nodes.service.js";
import { createNodeByWebhookSchema, type createNodeByWebhookSchemaType } from "./webhook.schema.js";
import { NodeType, Priority } from "../../generated/prisma/index.js";

export const webhookRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: createNodeByWebhookSchemaType }>('',
    {
      preHandler: [authenticateWebhook],
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "1 minute",
          keyGenerator: (request) => {
            return request.headers.authorization?.replace("Bearer ", "") ?? request.ip
          },
          errorResponseBuilder: (request, context) => ({
                  statusCode: 429,
                  error: 'Too Many Requests',
                  message: `試行回数が多すぎます。${context.after} 後に再度お試しください。`
          })
        }
      },
      schema: { body: createNodeByWebhookSchema }
    },
    async (request, reply) => {
      const userId = request.user.userId
      const node = await createNode(userId, {
        nodeType: NodeType.task,
        priority: Priority.medium,
        title: request.body.title
      })
      reply.status(201).send(node)
    }
  )
}
