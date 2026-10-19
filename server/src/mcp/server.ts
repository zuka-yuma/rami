import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerGetTree, registerCreateNode, registerDeleteNode, registerMoveNode, registerUpdateNode, registerListNodes, registerDuplicateNode } from "./tools/nodes.js"
import { registerToggleType, registerAddSteps, registerReorderNodes, registerReorderSteps } from "./tools/steps.js"
import { registerGetProgress } from "./tools/progress.js"

export const createMcpServer = () => {
  const mcp = new McpServer({
    name: "rami",
    version: "1.0.0",
  })
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
  registerGetProgress(mcp)
  registerDuplicateNode(mcp)
  return mcp
}
