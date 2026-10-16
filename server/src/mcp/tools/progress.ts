import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getUserId } from "../userId.js"
import { z } from "zod"
import { getProgress } from "../../modules/nodes/progress.service.js"

const getProgressSchema = {
  nodeId: z.string().nullable().default(null)
}

export const registerGetProgress = (mcp: McpServer) => {
  mcp.registerTool(
    "get_progress",
    {
      title: 'ノードの進捗取得',
      description: '進捗を集計して total / done / percentage / current を返す。nodeId を指定するとその直下の子(phase ノードならステップ、task ノードならサブタスク)を数え、省略するとルートノード(プロジェクト単位)を数える。current は「いま取り組むべきもの」で、in_progress のものを優先し、無ければ最初の todo、すべて done なら null になる。子を持たないノードを指定した場合はすべて 0 を返す。存在しない nodeId を指定した場合はエラーになる。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      },
      inputSchema: getProgressSchema,
    },
    async ({ nodeId }) => {
      const data = await getProgress(getUserId(), nodeId)
      return {
        content: [
          {
            type: "text",
            text: `${JSON.stringify(data)}`,
          },
        ],
      }
    }
  )
}
