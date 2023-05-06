import swagger, { SwaggerOptions } from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { Static, TProperties, TSchema, Type } from '@sinclair/typebox'
import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import pino from 'pino'
import { authenticate } from './auth'
import { HTTPException } from './errors'

export const Schema = <T extends TProperties>(id: string, schema: T) => Type.Object(schema, { $id: id })

/**
 * Initializes a Fastify server instance with given schemas, server specification and implementation.
 */
export const server = <T extends Schemas, S extends ServerSpec<T>>(schemas: T, spec: S, impl: ServerImpl<T, S>) => {
  const app = getBaseServer()
  app.register((app) => registerRoutes(app, schemas, spec, impl))
  return app
}

/**
 * Type-check the given module specification with the provided schemas.
 */
export const moduleSpec = <T extends Schemas, M extends ModuleSpec<T>>(schemas: T, spec: M) => {
  return spec
}

/**
 * Type-check a module implementation with the provided schemas and module spec.
 */
export const moduleImpl = <T extends Schemas, M extends ModuleSpec<T>, I extends ModuleImpl<T, M>>(
  schemas: T,
  spec: M,
  impl: I
) => {
  return impl
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Represents a set of JSON schemas.
 */
type Schemas = {
  [id: string]: TSchema
}

type RouteSpec<T extends Schemas> = {
  path: `${Method} /${string}`
  auth?: boolean | undefined
  body?: Extract<keyof T, string> | undefined
  params?: Extract<keyof T, string> | undefined
  query?: Extract<keyof T, string> | undefined
  response?: Extract<keyof T, string> | undefined
}

/**
 * A module is a collection of routes. A module is basically a (mostly) self-contained feature of the app.
 */
type ModuleSpec<T extends Schemas> = {
  path: string
  routes: {
    [route: string]: RouteSpec<T>
  }
}

/**
 * A server is a collection of modules.
 */
type ServerSpec<T extends Schemas> = {
  [module: string]: ModuleSpec<T>
}

type ServerImpl<T extends Schemas, S extends ServerSpec<T>> = {
  [Module in keyof S]: ModuleImpl<T, S[Module]>
}

type ModuleImpl<T extends Schemas, M extends ModuleSpec<T>> = {
  [Route in keyof M['routes']]: RouteHandlerImpl<T, M['routes'][Route]>
}

type RouteHandlerImpl<T extends Schemas, R extends RouteSpec<T>> = (
  request: TypedRequest<T, R>
) => Promise<Static<T[NonNullable<R['response']>]>>

type TypedRequest<T extends Schemas, R extends RouteSpec<T>> = FastifyRequest<{
  Body: Static<T[NonNullable<R['body']>]>
  Querystring: Static<T[NonNullable<R['query']>]>
  Params: Static<T[NonNullable<R['params']>]>
  Reply: Static<T[NonNullable<R['response']>]>
}>

const setupSwagger = (app: FastifyInstance) => {
  const swaggerOptions: SwaggerOptions = {
    openapi: {
      info: {
        title: 'API',
        version: '0.0.1',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    refResolver: {
      // By default Fastify swagger will auto-generate IDs for schemas in the
      // form def-0, def-1, etc. (When we specify $id on our schemas, it's used
      // as the title for the schema which is different than the ID). This code
      // tells Swagger to use the schema titles as the IDs (improves readability
      // of OpenAPI spec and generated code).
      // Comment this out and head to the /docs/json endpoint to see the difference.
      buildLocalReference: (json, _baseUri, _fragment, i) => `${json.$id}` || `def-${i}`,
    },
  }
  app.register(swagger, swaggerOptions)
  app.register(swaggerUI, {
    routePrefix: '/docs',
  })
  return app
}

const getBaseServer = () => {
  const app = fastify({
    logger: pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss',
        },
      },
    }),
  })
  setupSwagger(app)
  return app
}

const registerRoutes = <T extends Schemas, S extends ServerSpec<T>, I extends ServerImpl<T, S>>(
  app: FastifyInstance,
  schemas: T,
  spec: S,
  impl: I
) => {
  // Register schemas
  for (const $id in schemas) {
    app.addSchema(schemas[$id])
  }

  // Routing
  for (const [moduleName, moduleSpec] of Object.entries(spec)) {
    const basePath = moduleSpec.path

    for (const [routeName, routeSpec] of Object.entries(moduleSpec.routes)) {
      const [method, path] = routeSpec.path.split(' ') as [Method, string]
      const routeHandler = impl[moduleName][routeName]
      app.route({
        method,
        url: `${basePath}${path.replace(/\/$/, '')}`,
        preHandler: routeSpec.auth !== false ? authenticate : undefined,
        schema: {
          ...(routeSpec.query && { querystring: { $ref: routeSpec.query } }),
          ...(routeSpec.params && { params: { $ref: routeSpec.params } }),
          ...(routeSpec.body && { body: { $ref: routeSpec.body } }),
          response: { ...(routeSpec.response && { 200: { $ref: routeSpec.response } }) },
          tags: [moduleName],
          operationId: routeName,
        },
        handler: async (request, reply) => {
          try {
            const result = await routeHandler(request as Parameters<typeof routeHandler>[0])
            reply.code(200).send(result)
          } catch (e) {
            if (e instanceof HTTPException) {
              reply.code(e.statusCode).send({ detail: e.message })
            } else {
              console.error(e)
              reply.code(500).send({ detail: 'Unknown error' })
            }
          }
        },
      })
    }
  }
  return app
}
