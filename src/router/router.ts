import {TSchema, Type} from '@sinclair/typebox';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {HTTPException} from '../errors';
import {UnauthenticatedSchema} from '../schemas/errors';
import {IRouteSchema, IRouteSpec, ITypedRequest} from './interfaces';

export function route<T extends IRouteSchema>(spec: IRouteSpec<T>) {
  return spec;
}

/**
 * Register the given route spec with the given server instance.
 * @param instance The Fastify server instance. Make sure it's already using the TypeBox type provider.
 * @param spec The route specification.
 */
export function registerRoute<T extends IRouteSchema>(instance: FastifyInstance, spec: IRouteSpec<T>) {
  // First register the body and response schemas with fastify so they show up the OpenAPI spec.
  if (spec.schema.body) {
    registerSchema(instance, spec.schema.body);
  }
  if (spec.schema.response) {
    registerSchema(instance, spec.schema.response);
  }
  instance.route({
    method: spec.method,
    url: spec.url,
    schema: {
      ...(spec.schema.query && {querystring: Type.Ref(spec.schema.query)}),
      ...(spec.schema.body && {body: Type.Ref(spec.schema.body)}),
      ...(spec.schema.params && {params: Type.Ref(spec.schema.params)}),
      response: {
        ...(spec.schema.response && {200: Type.Ref(spec.schema.response)}),
        ...(spec.auth && {401: Type.Ref(UnauthenticatedSchema)}),
      },
      tags: [spec.docs.tag],
      operationId: spec.docs.operationId,
      description: spec.docs.description,
    },
    handler: async function (req: FastifyRequest, reply: FastifyReply) {
      let response;
      const handleParams = {
        instance: instance,
        // Need to cast during run-time because Fastify cannot know at compile-time which fields will be available
        req: req as FastifyRequest<ITypedRequest<T>>,
        reply: reply,
      };
      try {
        if (spec.auth) {
          // TODO: do authentication here
          await reply.code(401).send({detail: 'Not authenticated'});
        } else {
          response = await spec.handle(handleParams);
        }
        await reply.code(200).send(response);
      } catch (e: unknown) {
        if (e instanceof HTTPException) {
          await reply.code(e.statusCode).send({detail: e.message});
        } else {
          await reply.code(500).send({detail: 'Internal server error'});
        }
      }
    },
  });
}

/**
 * This function registers a TypeBox schema with Fastify. This allows us to see the type in
 * the generated documentation (as opposed to an anonymous type) and will be useful when
 * generating API clients from the OpenAPI spec.
 */
function registerSchema<T extends TSchema>(instance: FastifyInstance, schema: T) {
  if (schema.$id && !instance.getSchema(schema.$id)) {
    instance.addSchema(schema);
  }
}
