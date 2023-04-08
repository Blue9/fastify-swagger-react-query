import { Type } from '@sinclair/typebox'
import { moduleImpl, moduleSpec, routeImpl, server } from './server'

// 1. Define your schemas
const schemas = {
  HelloRequest: { recipient: Type.Optional(Type.String()) },
  HelloResponse: { hello: Type.String() },
}

// 2. Define your modules
const helloModuleSpec = moduleSpec(schemas, {
  path: `/hello`,
  routes: {
    getHelloWorld: {
      url: `GET /`,
      query: `HelloRequest`,
      response: `HelloResponse`,
    },
  },
})

// 3. Implement your routes
const getHelloWorld = routeImpl(schemas, helloModuleSpec, `getHelloWorld`, async ({ query }) => {
  return { hello: (query.recipient ?? 'World') + '!' }
})

// 4. Build your modules
const helloModuleImpl = moduleImpl(schemas, helloModuleSpec, {
  getHelloWorld,
})

// 5. Build the server
const serverSpec = { hello: helloModuleSpec }
const serverImpl = { hello: helloModuleImpl }
export const app = server(schemas, serverSpec, serverImpl)
