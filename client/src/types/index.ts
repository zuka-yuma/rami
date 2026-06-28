export type Node = {
    id: string
    title: string
    userId: string
    parentId: string | null
    nodetype: NodeType
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
    deadline?: string
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