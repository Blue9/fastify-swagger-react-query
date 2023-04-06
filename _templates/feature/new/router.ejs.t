---
to: src/modules/<%= feature %>/router.ts
---
import type {FastifyInstance} from "fastify";

import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {registerRoute} from "../../router/router";
import * as routes from "./routes";
// mark-imports

export async function <%= feature %>Module(fastify: FastifyInstance) {
  const router = fastify.withTypeProvider<TypeBoxTypeProvider>();
  // mark-routes
}
