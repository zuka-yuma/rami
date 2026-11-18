import 'fastify'
import { verifyApiToken } from '../modules/auth/apiToken.service.js'
import { UnauthorizedError } from '../utils/errors.js'
import type { FastifyRequest } from 'fastify'

export const authenticateWebhook = async (request: FastifyRequest) => {
  const token = request.headers.authorization?.replace("Bearer ", "")
  if (!token) {
    throw new UnauthorizedError()
  }
  const userId = await verifyApiToken(token)
  request.user = { userId }
}
