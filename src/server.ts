import fastify, { FastifyInstance, FastifyReply } from 'fastify'
import swagger, { SwaggerOptions } from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import pino from 'pino'
import { Static, TProperties, Type } from '@sinclair/typebox'
import { TObject } from '@sinclair/typebox'

export const server = <T extends Schemas, S extends ServerSpec<T>>(schemas: T, spec: S, impl: ServerImpl<T, S>) => {
  const app = getBaseServer()
  app.register((app) => registerRoutes(app, schemas, spec, impl))
  return app
}

export const moduleSpecBuilder =
  <T extends Schemas>(schemas: T) =>
  <M extends ModuleSpec<T>>(spec: M) => {
    return spec
  }

export const routeImplBuilder =
  <T extends Schemas, M extends ModuleSpec<T>>(schemas: T, spec: M) =>
  <RouteName extends keyof M['routes'], I extends RouteHandlerImpl<T, M['routes'][RouteName]>>(
    routeName: RouteName,
    impl: I
  ) => {
    return impl
  }

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type Schemas = {
  [id: string]: TProperties
}

type RouteSpec<T extends Schemas> = {
  url: `${Method} /${string}`
  body?: Extract<keyof T, string> | undefined
  params?: Extract<keyof T, string> | undefined
  query?: Extract<keyof T, string> | undefined
  response?: Extract<keyof T, string> | undefined
}

type ModuleSpec<T extends Schemas> = {
  path: string
  routes: {
    [route: string]: RouteSpec<T>
  }
}

type ServerSpec<T extends Schemas> = {
  [module: string]: ModuleSpec<T>
}

type RouteHandlerImpl<T extends Schemas, R extends RouteSpec<T>> = (
  args: ExtractArgs<T, R>
) => Promise<Static<TObject<T[NonNullable<R['response']>]>>>

type ModuleImpl<T extends Schemas, M extends ModuleSpec<T>> = {
  [Route in keyof M['routes']]: RouteHandlerImpl<T, M['routes'][Route]>
}

type ServerImpl<T extends Schemas, S extends ServerSpec<T>> = {
  [Module in keyof S]: ModuleImpl<T, S[Module]>
}

type ExtractArgs<T extends Schemas, R extends RouteSpec<T>> = {
  [K in keyof R]: K extends 'query' | 'params' | 'body' ? Static<TObject<T[NonNullable<R[K]>]>> : never
} & { instance: FastifyInstance }

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
    disableRequestLogging: true,
  })

  // Swagger
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

const registerRoutes = <T extends Schemas, S extends ServerSpec<T>, I extends ServerImpl<T, S>>(
  app: FastifyInstance,
  schemas: T,
  spec: S,
  impl: I
) => {
  // Register schemas
  for (const $id in schemas) {
    app.addSchema(Type.Object(schemas[$id], { $id }))
  }

  // Routing
  for (const [moduleName, moduleSpec] of Object.entries(spec)) {
    const modulePath = moduleSpec.path.startsWith('/') ? moduleSpec.path : `/${moduleSpec.path}`

    for (const [routeName, routeSpec] of Object.entries(moduleSpec.routes)) {
      const [method, path] = routeSpec.url.split(' ') as [Method, string]
      const routeHandler = impl[moduleName][routeName]
      app.route({
        method,
        url: `${modulePath}${path.replace(/\/$/, '')}`,
        schema: {
          querystring: routeSpec.query && Type.Ref(Type.Any({ $id: routeSpec.query })),
          params: routeSpec.params && Type.Ref(Type.Any({ $id: routeSpec.params })),
          body: routeSpec.body && Type.Ref(Type.Any({ $id: routeSpec.body })),
          response: {
            200: routeSpec.response && Type.Ref(Type.Any({ $id: routeSpec.response })),
          },
          tags: [moduleName],
          operationId: routeName,
        },
        handler: async (request, reply: FastifyReply) => {
          const args = {
            query: request.query,
            params: request.params,
            body: request.body,
            instance: app,
          } as Parameters<typeof routeHandler>[0]
          const result = await routeHandler(args)
          reply.send(result)
        },
      })
    }
  }
  return app
}
