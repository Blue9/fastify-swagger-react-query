Barebones Fastify server with auto-generated docs (Swagger) and client (React Query).

# Backend

Set up using `npm install`.

Run the server using `npm run dev`. This runs the example server in `src/app.ts`. Go to `localhost:4000/docs` to view the docs.

Generate the react query client by running `npm run generateclient`.
Edit the location of the generated client in `generate-client.ts` (you'll also have to edit the `generateclient` script in package.json).

## Usage

A server is a collection of modules, which are collections of endpoints. Every endpoint is typed using [TypeBox](https://github.com/sinclairzx81/typebox), which type-checks all of your endpoints and is used by [fastify-swagger](https://github.com/fastify/fastify-swagger) to generate API documentation for you. Authentication is supported—just implement `src/auth.ts`.

Below is the example server that's run when you run `npm run dev` (copy of `src/app.ts`).

```ts
export const app = server(
  { // 1. Schemas.
    HelloRequest: Schema('HelloRequest', { recipient: Type.Optional(Type.String()) }),
    HelloResponse: Schema('HelloResponse', { hello: Type.String() }),
  },
  { // 2. Module specs.
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
  { // 3. Module implementations.
    hello: {
      getHelloWorld: async ({ query }) => {
        return { hello: query.recipient ?? 'World' }
      },
    },
  }
)
```

You can also break things up as your server grows in complexity. The `moduleSpec` and `moduleImpl` helper functions can assist with type-checking.

```ts
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
```

## Why

Why separate the server spec (routes and types) and the implementation (route handlers)? This is mostly a personal preference, but I find that distinguising between a server's interface and its functionality makes it easier to quickly understand what a module's role is. Other developers can skim a module's spec to understand its functionality without the implementation details getting in the way.

Think of defining a server module's specification as constructing its "type," outlining the structure and features of the module. Defining the implementation is similar to defining a variable satisfying the defined type, building the concrete realization of these expectations.
