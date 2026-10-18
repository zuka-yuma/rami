import type { FastifyInstance } from "fastify"
import { authenticateMcp } from "../plugins/authenticateApiToken.js"
import { createMcpServer } from "./server.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"


export const mcpRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/mcp', {
    preHandler: [authenticateMcp]
  }, async (request, reply) => {
    const mcp = createMcpServer()
    const transport = new StreamableHTTPServerTransport()
    // SDK の Transport は onclose? で、実装側は onclose: ... | undefined のため
    // exactOptionalPropertyTypes の下では代入できない。SDK 側の型の問題なのでここでキャストする
    await mcp.connect(transport as Transport)
    reply.hijack()
    await transport.handleRequest(request.raw, reply.raw, request.body)
    await transport.close()
    }
  )
}
