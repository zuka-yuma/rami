import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getUserId } from "../userId.js"
import { z } from "zod"
import { toggleType, addSteps, reorderSteps, reorderNodes } from "../../modules/nodes/step.service.js"
import { NodeType} from "../../generated/prisma/index.js"

const toggleTypeSchema = {
  nodeId: z.string(),
  nodeType: z.enum(NodeType)
}

export const registerToggleType = (mcp: McpServer) => {
  mcp.registerTool(
    "toggle_type",
    {
      title: 'ノード種類の変更',
      description: 'ノードの種類を task と phase で切り替える。単なる表示上のフラグではなく、子ノードの並び順が変換される: task から phase にすると子の並び順(sort)がステップ番号(step 1,2,3...)に変換され、phase から task にすると逆の変換が行われる。phase にするとステップのプログレス表示と順序ルールの対象になる。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: toggleTypeSchema,
    },
    async ({ nodeId, nodeType }) => {
      await toggleType(getUserId(), nodeId, nodeType)
      return {
        content: [
          {
            type: "text",
            text: "toggled",
          },
        ],
      }
    }
  )
}

const addStepsSchema = {
  parentId: z.string(),
  data: z.array(z.object({
    title: z.string(),
    nodeType: z.enum(NodeType)
  }))
}

export const registerAddSteps = (mcp: McpServer) => {
  mcp.registerTool(
    "add_steps",
    {
      title: 'ステップ一括追加',
      description: 'phase ノードの配下にステップを複数まとめて追加する。配列の順序がそのままステップ番号(step)になり、既にステップがある場合はその後ろに続けて採番される。親が phase ノードでない場合は使えない(その場合は create_node を使う)。ステップを1件だけ追加する場合も create_node で足りる。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: addStepsSchema,
    },
    async ({ parentId, data }) => {
      const node = await addSteps(getUserId(), parentId, data)
      return {
        content: [
          {
            type: "text",
            text: `${JSON.stringify(node)}`,
          },
        ],
      }
    }
  )
}

const reorderNodeSchema = {
  parentId: z.string().nullable(),
  orderedIds: z.array(z.string())
}

const reorderStepSchema = {
  parentId: z.string(),
  orderedIds: z.array(z.string())
}

export const registerReorderNodes = (mcp: McpServer) => {
  mcp.registerTool(
    "reorder_nodes",
    {
      title: 'タスクの並び替え',
      description: 'task ノードの子の並び順(sort)を指定された順序に振り直す。parentId にはその親ノードの id を渡し、ルートノード(最上位)を並べ替える場合は null を渡す。orderedIds にはその親の子を全件、新しい順序で渡す必要がある(一部だけ渡すとエラーになる)。並べ替え対象が phase ノードの子である場合は reorder_steps を使う。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: reorderNodeSchema,
    },
    async ({ parentId, orderedIds }) => {
      await reorderNodes(getUserId(), parentId, orderedIds)
      return {
        content: [
          {
            type: "text",
            text: "reordered",
          },
        ],
      }
    }
  )
}

export const registerReorderSteps = (mcp: McpServer) => {
  mcp.registerTool(
    "reorder_steps",
    {
      title: 'ステップの並び替え',
      description: 'phase ノードの子のステップ番号(step)を指定された順序に振り直す。parentId には phase ノードの id を渡す。orderedIds にはその親の子を全件、新しい順序で渡す必要がある(一部だけ渡すとエラーになる)。task ノードの子を並べ替える場合は reorder_nodes を使う。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: reorderStepSchema,
    },
    async ({ parentId, orderedIds }) => {
      await reorderSteps(getUserId(), parentId, orderedIds)
      return {
        content: [
          {
            type: "text",
            text: "reordered",
          },
        ],
      }
    }
  )
}
