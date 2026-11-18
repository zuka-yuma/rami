export type Node = {
    id: string
    title: string
    userId: string
    parentId: string | null
    nodeType: NodeType
    status: Status
    priority: Priority
    deadline: string | null
    sort: number
    step: number
    collapse: boolean
    createAt: string
    updateAt: string
}

export type User = {
    id: string
    email: string
    name: string
}

export type TreeNode = Node & {
    children: TreeNode[]
}

export type PhaseProgress = {
    total: number
    done: number
    current: TreeNode | null
    percentage: number
}

export type CreateNodeInput = {
    title: string
    parentId?: string
    nodeType: NodeType
    priority: Priority
    deadline?: string
}

export type UpdateNodeInput = {
    title?: string
    status?: Status
    priority?: Priority
    deadline?: string | null
    collapse?: boolean
}

export type MoveNodeInput = {
    parentId: string | null
}

export type ToggleTypeInput = {
    nodeType: NodeType
}

export type AddStepsInput = {
    steps: {
        title: string
        nodeType: NodeType
    }[]
}

export type ReorderInput = {
    orderedIds: string[]
}

export type NodeType = "task" | "phase"

export type Status = "todo" | "in_progress" | "done"

export type Priority = "high" | "medium" | "low"
// API トークンの一覧表示用。平文のトークンは発行直後の1回しか返らないので含めない。
export type ApiTokenSummary = {
    id: string
    name: string
    createdAt: string
    lastUsedAt: string | null
    // 失効済みなら日時。監査のため行は消さず、一覧では既定で隠す
    revokedAt: string | null
}

export type IssueApiTokenInput = {
  name: string
}

export type ApiToken = {
  token: string
}
