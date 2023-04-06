---
inject: true
to: src/schemas/index.ts
before: "// mark-imports"
---
import <%= feature %> from './<%= feature %>';
