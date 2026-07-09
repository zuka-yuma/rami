import { Type, type Static } from '@sinclair/typebox'

const importNodeSchema = Type.Recursive(Self => Type.Object({
    title: Type.String(),
    nodeType: Type.Union([Type.Literal('task'), Type.Literal('phase')]),
    status: Type.Union([Type.Literal('todo'), Type.Literal('in_progress'), Type.Literal('done')]),
    priority: Type.Union([Type.Literal('high'), Type.Literal('medium'), Type.Literal('low')]),
    deadline: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    step: Type.Optional(Type.Number()),
    sort: Type.Optional(Type.Number()),
    children: Type.Array(Self)
}))

export type importNodeSchemaType = Static<typeof importNodeSchema>

export const importSchema = Type.Array(importNodeSchema)

export type importSchemaType = Static<typeof importSchema>
