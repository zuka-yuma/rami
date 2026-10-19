import 'fastify'
import { verifyApiToken } from '../modules/auth/apiToken.service.js'
import { UnauthorizedError } from '../utils/errors.js'
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import type { FastifyRequest } from 'fastify'

declare module 'http' {
    interface IncomingMessage {
      auth?: AuthInfo
    }
}

export const authenticateMcp = async (request: FastifyRequest) => {
  const apiToken = request.headers.authorization?.replace("Bearer ", "")
  if (!apiToken) {
    throw new UnauthorizedError()
  }
  const userId = await verifyApiToken(apiToken)
  const info: AuthInfo = {
    token: apiToken,
    clientId: "api-token",
    scopes: [],
    extra: { userId }
  }
  request.raw.auth = info
}
