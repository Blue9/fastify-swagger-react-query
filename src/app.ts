import { Type } from '@sinclair/typebox'
import { moduleSpec, moduleImpl, server, Schema } from './server'

// 1. Define your schemas using TypeBox
// Use Schema(TypeName, { ... }) to define each schema. This assigns an
// ID to the type which allows you to reference it in other types using
// Type.Ref(...). This also avoids duplicate type generation when
// generating the client types.
// See https://github.com/sinclairzx81/typebox#reference-types and
// https://swagger.io/docs/specification/using-ref/ for more.
const HelloRequest = Schema('HelloRequest', {
  recipient: Type.Optional(Type.String()),
})
const HelloResponse = Schema('HelloResponse', { hello: Type.String() })

const schemas = {
  HelloRequest,
  HelloResponse,
}

// 2. Define module.
const helloModuleSpec = moduleSpec(schemas, {
  path: `/hello`,
  routes: {
    getHelloWorld: {
      auth: false,
      path: `GET /`,
      query: `HelloRequest`, // <-- Fully typed, must be keyof schemas
      response: `HelloResponse`,
    },
  },
})

// 3. Implement module as a map from endpoint to handler.
// Handlers take in a typed FastifyRequest object.
const helloModuleImpl = moduleImpl(schemas, helloModuleSpec, {
  getHelloWorld: async ({ query, server, headers }) => {
    console.log(server.version, headers.host)
    return { hello: query.recipient ?? 'World' }
  },
})

// 5. Define the server spec and implementation.
const serverSpec = { hello: helloModuleSpec }
const serverImpl = { hello: helloModuleImpl }
export const app = server(schemas, serverSpec, serverImpl)

// Appendix: Everything in one step:
const app2 = server(
  {
    HelloRequest: Schema('HelloRequest', { recipient: Type.Optional(Type.String()) }),
    HelloResponse: Schema('HelloResponse', { hello: Type.String() }),
  },
  {
    hello: {
      path: `/hello`,
      routes: {
        getHelloWorld: {
          auth: false,
          path: `GET /`,
          query: `HelloRequest`, // <-- Fully typed, must be a key in `schemas`
          response: `HelloResponse`,
        },
      },
    },
  },
  {
    hello: {
      getHelloWorld: async ({ query }) => {
        return { hello: query.recipient ?? 'World' }
      },
    },
  }
)
