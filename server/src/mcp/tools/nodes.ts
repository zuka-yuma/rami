import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { moveNode, deleteNode, updateNode, createNode, getAll } from "../../modules/nodes/nodes.service.js"
import { getUserId } from "../userId.js"
import { z } from "zod"
import type { createNodeSchemaType, updateNodeSchemaType } from "../../modules/nodes/nodes.schema.js"
import { Status, Priority, NodeType } from "../../generated/prisma/index.js"

export const registerGetTree = (mcp: McpServer) => {
  mcp.registerTool(
    "get_tree",
    {
      title: 'ツリー取得',
      description: '自分のタスクツリー全体を階層構造(JSON)で返す。各ノードは id・title・nodeType・status・priority・deadline・階層順(sort/step)を持つ。他のツールに渡す nodeId はここから取得する。条件で絞り込みたい場合は list_nodes を使う。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
    async () => {
      const tree = await getAll(getUserId())
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
}

const createNodeSchema = {
  data: z.object({
    parentId: z.string().optional(),
    deadline: z.string().optional(),
    priority: z.enum(Priority),
    title: z.string(),
    nodeType: z.enum(NodeType)
  })
}

export const registerCreateNode = (mcp: McpServer) => {
  mcp.registerTool(
    "create_node",
    {
      title: 'ノード作成',
      description: 'ノードを1件作成する。parentId を指定するとその子として作られ、省略するとルートになる。親が phase ノードならステップ番号(step)が自動で採番され、task ノードなら並び順(sort)が採番される。phase ノードの配下にステップを複数まとめて作る場合は add_steps の方が適している。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: createNodeSchema,
    },
    async ({ data }) => {
      const new_data: createNodeSchemaType = {
        priority: data.priority,
        title: data.title,
        nodeType: data.nodeType
      }
      if (data.parentId !== undefined) new_data.parentId = data.parentId
      if (data.deadline !== undefined) new_data.deadline = data.deadline
      const node = await createNode(getUserId(), new_data)
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

const updateNodeSchema = {
  nodeId: z.string(),
  data: z.object({
    deadline: z.string().optional(),
    priority: z.enum(Priority).optional(),
    title: z.string().optional(),
    status: z.enum(Status).optional(),
    collapse: z.boolean().optional()
  })
}

export const registerUpdateNode = (mcp: McpServer) => {
  mcp.registerTool(
    "update_node",
    {
      title: 'ノード更新',
      description: '既存ノードの title / status / priority / deadline / collapse を更新する。指定したフィールドのみ変更され、省略したフィールドは現在の値が保たれる。更新後のノードを返す。ステップの順序ルール(手前が未完了なら進められない)は適用されないため、手前を飛ばして status を done にできる。子を持つノードの status は子の状態から自動計算されるため、親に対する status 指定は上書きされることがある。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: updateNodeSchema,
    },
    async ({ data, nodeId }) => {
      const new_data: updateNodeSchemaType = {}
      if (data.deadline !== undefined) new_data.deadline = data.deadline
      if (data.priority !== undefined) new_data.priority = data.priority
      if (data.title !== undefined) new_data.title = data.title
      if (data.status !== undefined) new_data.status = data.status
      if (data.collapse !== undefined) new_data.collapse = data.collapse
      const node = await updateNode(getUserId(), nodeId, new_data)
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

const deleteNodeSchema = {
  nodeId: z.string()
}

export const registerDeleteNode = (mcp: McpServer) => {
  mcp.registerTool(
    "delete_node",
    {
      title: 'ノード削除',
      description: '指定ノードを削除する。配下の子ノードもすべて再帰的に削除される(元に戻せない)。削除前に get_tree で影響範囲を確認することを推奨。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        destructiveHint: true,
      },
      inputSchema: deleteNodeSchema,
    },
    async ({ nodeId }) => {
      await deleteNode(getUserId(), nodeId)
      return {
        content: [
          {
            type: "text",
            text: "deleted",
          },
        ],
      }
    }
  )
}

const moveNodeSchema = {
  nodeId: z.string(),
  newParentId: z.string().nullable()
}

export const registerMoveNode = (mcp: McpServer) => {
  mcp.registerTool(
    "move_node",
    {
      title: 'ノード移動',
      description: '指定ノードを別の親の配下へ移動する。newParentId に null を渡すとルートへ移動する。自分自身の子孫の配下へは移動できない(循環参照の防止)。移動元が phase ノードだった場合、残ったステップ番号は自動で振り直される。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        destructiveHint: false,
      },
      inputSchema: moveNodeSchema,
    },
    async ({ nodeId, newParentId }) => {
      const node = await moveNode(getUserId(), nodeId, newParentId)
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
