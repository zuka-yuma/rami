import type { FastifyInstance, FastifyBaseLogger,  RawReplyDefaultExpression,  RawRequestDefaultExpression,  RawServerDefault } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

export type FastifyTypebox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>