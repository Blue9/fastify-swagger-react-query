---
inject: true
to: src/app.ts
before: "// mark-routers"
---
app.register(modules.<%= feature %>Module, { prefix: "<%= path %>" });