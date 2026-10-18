import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { moveNode, deleteNode, updateNode, createNode, getAll, listNodes, duplicateNode } from "../../modules/nodes/nodes.service.js"
import { getUserId } from "../userId.js"
import { z } from "zod"
import type { createNodeSchemaType, listNodesSchemaType, updateNodeSchemaType } from "../../modules/nodes/nodes.schema.js"
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
    async (extra) => {
      const tree = await getAll(getUserId(extra.authInfo))
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
    async ({ data }, extra) => {
      const new_data: createNodeSchemaType = {
        priority: data.priority,
        title: data.title,
        nodeType: data.nodeType
      }
      if (data.parentId !== undefined) new_data.parentId = data.parentId
      if (data.deadline !== undefined) new_data.deadline = data.deadline
      const node = await createNode(getUserId(extra.authInfo), new_data)
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
    async ({ data, nodeId }, extra) => {
      const new_data: updateNodeSchemaType = {}
      if (data.deadline !== undefined) new_data.deadline = data.deadline
      if (data.priority !== undefined) new_data.priority = data.priority
      if (data.title !== undefined) new_data.title = data.title
      if (data.status !== undefined) new_data.status = data.status
      if (data.collapse !== undefined) new_data.collapse = data.collapse
      const node = await updateNode(getUserId(extra.authInfo), nodeId, new_data)
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
    async ({ nodeId }, extra) => {
      await deleteNode(getUserId(extra.authInfo), nodeId)
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
    async ({ nodeId, newParentId }, extra) => {
      const node = await moveNode(getUserId(extra.authInfo), nodeId, newParentId)
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


const listNodesSchema = {
  priority: z.enum(Priority).optional(),
  status: z.enum(Status).optional(),
}

export const registerListNodes = (mcp: McpServer) => {
  mcp.registerTool(
    "list_nodes",
    {
      title: 'ノード検索',
      description: '条件に合うノードをフラットな配列(階層なし)で返す。status / priority を指定すると絞り込み、両方省略すると全ノードを返す。絞り込むと親が除外されて子だけが残ることがあるため、結果から親子関係は読み取れない。ツリーの構造や各ノードの階層位置を知りたい場合は get_tree を使う。「進行中のタスクを挙げて」「優先度が高いものは何か」のような横断的な問いに向く。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      },
      inputSchema: listNodesSchema,
    },
    async ({ priority, status }, extra) => {
      const filter: listNodesSchemaType = {}
      if (priority !== undefined) filter.priority = priority
      if (status !== undefined) filter.status = status
      const list = await listNodes(getUserId(extra.authInfo), filter)
      return {
        content: [
          {
            type: "text",
            text: `${JSON.stringify(list)}`,
          },
        ],
      }
    }
  )
}

const duplicateNodeSchema = {
  nodeId: z.string(),
  includeChildren: z.boolean().optional().default(true),
  resetStatus: z.boolean().optional().default(true),
}

export const registerDuplicateNode = (mcp: McpServer) => {
  mcp.registerTool(
    "duplicate_node",
    {
      title: 'ノード複製',
      description: '指定ノードを複製し、元ノードと同じ親の直後に挿入する。複製されたノードを返す。includeChildren(既定 true)が true なら子ツリーごと再帰的に複製し、false なら指定ノードだけを複製する。resetStatus(既定 true)が true なら複製側の status をすべて todo に戻し、false なら元の status を引き継ぐ。タイトルには「のコピー」が付く(複製の起点のみ。子には付かない)。deadline は引き継がれず常にクリアされるため、必要なら複製後に update_node で設定する。複製により同じ親の兄弟の並び順(sort または step)は 1 から振り直される。',
      annotations: {
        openWorldHint: false,
        readOnlyHint: false,
      },
      inputSchema: duplicateNodeSchema,
    },
    async ({ nodeId, includeChildren, resetStatus }, extra) => {
      const node = await duplicateNode(getUserId(extra.authInfo), nodeId, includeChildren, resetStatus)
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
