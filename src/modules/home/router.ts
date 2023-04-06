import type {FastifyInstance} from "fastify";

import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {registerRoute} from "../../router/router";
import * as routes from "./routes";
// mark-imports

export async function homeModule(fastify: FastifyInstance) {
  const router = fastify.withTypeProvider<TypeBoxTypeProvider>();
  registerRoute(router, routes.helloWorld);
  // mark-routes
}
