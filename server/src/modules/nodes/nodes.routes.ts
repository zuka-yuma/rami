import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createNode, deleteNode, getAll, moveNode, updateNode } from "./nodes.service.js";
import { authenticate } from "../../plugins/authenticate.js";
import { addStepsSchema, createNodeSchema, moveNodeSchema, reorderSchema, toggleTypeSchema, updateNodeSchema, type addStepsSchemaType, type createNodeSchemaType, type moveNodeSchemaType, type reorderSchemaType, type toggleTypeSchemaType, type updateNodeSchemaType } from "./nodes.schema.js";
import { addSteps, reorderNodes, reorderSteps, toggleType } from "./step.service.js";


export const nodesRoutes = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.get('', 
        { preHandler: [authenticate] },
        async (request, reply) => {
            const userId = request.user.userId
            const tree = await getAll(userId)
            reply.status(200).send(tree)
        }
    )

    fastify.post<{ Body: createNodeSchemaType }>('',
        { preHandler: [authenticate], schema: { body: createNodeSchema } },
        async (request, reply) => {
            const userId = request.user.userId
            const node = await createNode(userId, request.body)
            reply.status(201).send(node)
        }
    )

    fastify.post<{ Params: { parentId: string }, Body: reorderSchemaType }>('/:parentId/reorder-nodes', 
        { preHandler: [authenticate], schema: { body: reorderSchema } },
        async (request, reply) => {
            const parentId = request.params.parentId
            await reorderNodes(parentId, request.body.orderedIds)
            reply.status(200).send()
        }
    )

    fastify.post<{ Params: { parentId: string }, Body: addStepsSchemaType }>('/:parentId/steps',
        { preHandler: [authenticate], schema: { body: addStepsSchema } },
        async (request, reply) => {
            const userId = request.user.userId
            const parentId = request.params.parentId
            const steps = await addSteps(userId, parentId, request.body.steps)
            reply.status(201).send(steps)
        }
    )

    fastify.delete<{ Params: { id: string } }>('/:id',
        { preHandler: [authenticate] },
        async (request, reply) => {
            const userId = request.user.userId
            const id = request.params.id
            await deleteNode(userId, id)
            reply.status(204).send()
        }
    )

    fastify.patch<{ Params: { id: string }, Body: updateNodeSchemaType }>('/:id',
        { preHandler: [authenticate], schema: { body: updateNodeSchema } },
        async (request, reply) => {
            const userId = request.user.userId
            const id = request.params.id
            const node = await updateNode(userId, id, request.body)
            reply.status(200).send(node)
        }
    )

    fastify.patch<{ Params: { id: string }, Body: moveNodeSchemaType }>('/:id/move',
        { preHandler: [authenticate], schema: { body: moveNodeSchema} },
        async (request, reply) => {
            const userId = request.user.userId
            const id = request.params.id
            const newParentId = request.body.parentId || null
            await moveNode(userId, id, newParentId)
            reply.status(200).send()
        }
    )

    fastify.patch<{ Params: { id: string }, Body: toggleTypeSchemaType }>('/:id/toggle-type',
        { preHandler: [authenticate], schema: {body: toggleTypeSchema } },
        async (request, reply) => {
            const userId = request.user.userId
            const id = request.params.id
            await toggleType(userId, id, request.body.nodeType)
            reply.status(200).send()
        }
    )
    
    fastify.patch<{ Params: { parentId: string }, Body: reorderSchemaType }>('/:parentId/reorder-steps',
        { preHandler: [authenticate], schema: {body: reorderSchema} },
        async (request, reply) => {
            const parentId = request.params.parentId
            await reorderSteps(parentId, request.body.orderedIds)
            reply.status(200).send()
        }
    )
}