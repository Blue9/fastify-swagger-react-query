import { Type } from '@sinclair/typebox'
import { moduleImpl, moduleSpec, routeImpl, server } from './server'

// 1. Define your schemas using TypeBox
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
      query: `HelloRequest`, // <-- Fully typed, must be a key in `schemas`
      response: `HelloResponse`,
    },
  },
})

// 3. Implement your routes
// Routes with complex types can get free type inference using routeImpl().
const getHelloWorld = routeImpl(schemas, helloModuleSpec, `getHelloWorld`, async ({ query, instance }) => {
  // instance is the server instance. Useful if you set fields through plugins.
  console.log(instance.version)
  return { hello: (query.recipient ?? 'World') + '!' }
})

// 4. Build your modules
const helloModuleImpl = moduleImpl(schemas, helloModuleSpec, {
  getHelloWorld,
})

// 5. Build the server (you can also do everything in one step)
const serverSpec = { hello: helloModuleSpec }
const serverImpl = { hello: helloModuleImpl }
export const app = server(schemas, serverSpec, serverImpl)
