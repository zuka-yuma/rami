import { Type, type Static } from '@sinclair/typebox'
import { NodeType, Priority, Status } from '../../generated/prisma/index.js'

export const createNodeSchema = Type.Object({
    title: Type.String(),
    parentId: Type.Optional(Type.String()),
    nodeType: Type.Enum(NodeType),
    priority: Type.Enum(Priority),
    deadline: Type.Optional(Type.String())
})
export type createNodeSchemaType = Static<typeof createNodeSchema>

export const updateNodeSchema = Type.Object({
    title: Type.Optional(Type.String()),
    status: Type.Optional(Type.Enum(Status)),
    priority: Type.Optional(Type.Enum(Priority)),
    deadline: Type.Optional(Type.String()),
    collapse: Type.Optional(Type.Boolean())
})
export type updateNodeSchemaType = Static<typeof updateNodeSchema>

export const moveNodeSchema = Type.Object({
    parentId: Type.Union([Type.String(), Type.Null()])
})
export type moveNodeSchemaType = Static<typeof moveNodeSchema>

export const toggleTypeSchema = Type.Object({
    nodeType: Type.Enum(NodeType)
})
export type toggleTypeSchemaType = Static<typeof toggleTypeSchema>

export const addStepsSchema = Type.Object({
    steps: Type.Array(Type.Object({
        title: Type.String(),
        nodeType: Type.Enum(NodeType)
    }))
})
export type addStepsSchemaType = Static<typeof addStepsSchema>

export const reorderSchema = Type.Object({
    orderedIds: Type.Array(Type.String())
})
export type reorderSchemaType = Static<typeof reorderSchema>
