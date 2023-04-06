---
inject: true
to: src/modules/<%= feature %>/router.ts
before: "// mark-routes"
---
  registerRoute(router, routes.<%= operationId %>);