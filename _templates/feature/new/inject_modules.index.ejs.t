---
inject: true
to: src/modules/index.ts
before: "// mark-exports"
---
export * from "./<%= feature %>";