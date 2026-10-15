import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { getAll } from "../modules/nodes/nodes.service.js"

const server = new McpServer({
  name: "minimal-mcp-server",
  version: "1.0.0",
})

const getTreeSchema = {
  userId: z.uuid()
}

server.registerTool(
  "get_tree",
  {
    title: 'getTree',
    description: '指定ユーザーのツリー全体を階層構造で返すツール',
    annotations: {
      openWorldHint: false,
      readOnlyHint: true,
    },
    inputSchema: getTreeSchema
  },
  async ({ userId }) => {
    const tree = await getAll(userId)
    return {
      content: [
        {
          type: "text",
          text: `${JSON.stringify(tree)}`,
        },
      ],
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
