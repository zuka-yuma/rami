import type { FastifyInstance } from "fastify"
import { authenticateMcp } from "../plugins/authenticateApiToken.js"
import { createMcpServer } from "./server.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"


export const mcpRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/mcp', {
    preHandler: [authenticateMcp],
    config: {
      rateLimit: {
        // Claude は1つの会話で十数回〜数十回ツールを呼ぶため、認証エンドポイント相当の
        // 厳しい上限（5回/分など）では正常な利用が止まる
        max: 100,
        timeWindow: "1 minute",
        // レート制限は onRequest フックで動き、preHandler より前なので request.raw.auth は未設定。
        // そのためトークン文字列をキーにする（1トークン = 1ユーザーなので粒度は userId と同じ）。
        // 認証前に弾かれるリクエスト用に IP をフォールバックに置く
        keyGenerator: (request) => {
          return request.headers.authorization?.replace("Bearer ", "") ?? request.ip
        },
        errorResponseBuilder: (request, context) => ({
                statusCode: 429,
                error: 'Too Many Requests',
                message: `試行回数が多すぎます。${context.after} 後に再度お試しください。`
        })
      }
    }
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
