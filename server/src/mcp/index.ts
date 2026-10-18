import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createMcpServer } from "./server.js"

async function main() {
  const transport = new StdioServerTransport()
  const mcp = createMcpServer()
  await mcp.connect(transport)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
