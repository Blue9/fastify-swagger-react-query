import { Type } from '@sinclair/typebox'
import { moduleSpecBuilder, routerBuilder, server } from './server'

// 1. Define your schemas using TypeBox
const schemas = {
  HelloRequest: { recipient: Type.Optional(Type.String()) },
  HelloResponse: { hello: Type.String() },
}

// 2. Define your modules. moduleSpecBuilder() is optional but it brings in-line type-checking.
const moduleSpec = moduleSpecBuilder(schemas)

const helloModuleSpec = moduleSpec({
  path: `/hello`,
  routes: {
    getHelloWorld: {
      url: `GET /`,
      auth: true,
      query: `HelloRequest`, // <-- Fully typed, must be a key in `schemas`
      response: `HelloResponse`,
    },
  },
})

// 3. Implement your routes.
// routerBuilder() is optional but it brings type-checking and type-inference so you don't have to explicitly type your function params.
const helloRouter = routerBuilder(schemas, helloModuleSpec)

const getHelloWorld = helloRouter(`getHelloWorld`, async ({ query, instance, request }) => {
  // instance and request are the server instance and raw request.
  console.log(instance.version, request.headers.host)
  return { hello: (query.recipient ?? 'World') + '!' }
})

// 4. Build your modules
const helloModuleImpl = {
  getHelloWorld,
}

// 5. Build the server (you can also do everything in one step; see below)
const serverSpec = { hello: helloModuleSpec }
const serverImpl = { hello: helloModuleImpl }
export const app = server(schemas, serverSpec, serverImpl)

// Appendix: Everything in one step:
const app2 = server(
  {
    HelloRequest: { recipient: Type.Optional(Type.String()) },
    HelloResponse: { hello: Type.String() },
  },
  {
    hello: {
      path: `/hello`,
      routes: {
        getHelloWorld: {
          url: `GET /`,
          query: `HelloRequest`, // <-- Fully typed, must be a key in `schemas`
          response: `HelloResponse`,
        },
      },
    },
  },
  {
    hello: {
      getHelloWorld: async ({ query, instance }) => {
        console.log(instance.version)
        return { hello: (query.recipient ?? 'World') + '!' }
      },
    },
  }
)
