import { Type, type Static } from '@sinclair/typebox'

export const registerSchema = Type.Object({
    email: Type.String({ format: "email"}),
    name: Type.String(),
    password: Type.String()
})
export type registerSchemaType = Static<typeof registerSchema>

export const loginSchema = Type.Object({
    email: Type.String({ format: "email"}),
    password: Type.String()
})
export type loginSchemaType = Static<typeof loginSchema>

export const responseSchema = Type.Object({
    accessToken: Type.String()
})
export type responseSchemaType = Static<typeof responseSchema>