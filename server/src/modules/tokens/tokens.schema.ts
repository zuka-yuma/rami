import { Type, type Static } from '@sinclair/typebox'

export const issueApiTokenSchema = Type.Object({
  name: Type.String()
})

export type issueApiTokenSchemaType = Static<typeof issueApiTokenSchema>
