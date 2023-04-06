---
to: src/modules/<%= feature %>/routes/<%= operationId %>.ts
---
<% Feature = h.changeCase.pascal(feature) %>
<% Operation = h.changeCase.pascal(operationId) %>
import {route} from "src/router/router";

// TODO: Schemas should go in src/schemas/<%= feature %>.ts (remove this comment before committing)
// Route
export const <%= operationId %> = route({
  auth: <%= auth %>,
  method: "<%= method %>",
  url: "<%= path %>",
  docs: {
    tag: "<%= feature %>",
    operationId: "<%= operationId %>",
    description: "<%= description %>",
  },
  schema: {
    // TODO
  },
  handle: async ({instance, req}) => {
    return {};
  },
});
