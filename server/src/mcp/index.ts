import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerGetTree, registerCreateNode, registerDeleteNode, registerMoveNode, registerUpdateNode, registerListNodes } from "./tools/nodes.js"
import { registerToggleType, registerAddSteps, registerReorderNodes, registerReorderSteps } from "./tools/steps.js"

const mcp = new McpServer({
  name: "minimal-mcp-server",
  version: "1.0.0",
})

async function main() {
  const transport = new StdioServerTransport()
  registerGetTree(mcp)
  registerCreateNode(mcp)
  registerDeleteNode(mcp)
  registerMoveNode(mcp)
  registerUpdateNode(mcp)
  registerToggleType(mcp)
  registerAddSteps(mcp)
  registerReorderNodes(mcp)
  registerReorderSteps(mcp)
  registerListNodes(mcp)
  await mcp.connect(transport)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
