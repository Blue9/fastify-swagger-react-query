import { Type } from '@sinclair/typebox'
import { moduleSpec, moduleImpl, server, Schema } from './server'

// 1. Define your schemas using TypeBox
const HelloRequest = Schema('HelloRequest', { recipient: Type.Optional(Type.String()) })
const HelloResponse = Schema('HelloResponse', { hello: Type.String() })

const schemas = {
  HelloRequest,
  HelloResponse,
}

// 2. Define your modules.
const helloModuleSpec = moduleSpec(schemas, {
  path: `/hello`,
  routes: {
    getHelloWorld: {
      auth: false,
      path: `GET /`,
      query: `HelloRequest`, // <-- Fully typed, must be a key in `schemas`
      response: `HelloResponse`,
    },
  },
})

// 3. Implement your modules
const helloModuleImpl = moduleImpl(schemas, helloModuleSpec, {
  getHelloWorld: async ({ query, server, headers }) => {
    console.log(server.version, headers.host)
    return { hello: query.recipient ?? 'World' }
  },
})

// 5. Build the server (you can also do everything in one step; see below)
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
      getHelloWorld: async ({ query, server }) => {
        console.log(server.version)
        return { hello: query.recipient ?? 'World' }
      },
    },
  }
)
