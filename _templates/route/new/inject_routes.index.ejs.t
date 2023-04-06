---
inject: true
to: src/modules/<%= feature %>/routes/index.ts
before: "// mark-exports"
---
export { <%= operationId %> } from "./<%= operationId %>";