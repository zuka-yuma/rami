import { Type, type Static } from '@sinclair/typebox'

export const createNodeByWebhookSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 })
}, {
  additionalProperties: false
})

export type createNodeByWebhookSchemaType = Static<typeof createNodeByWebhookSchema>
