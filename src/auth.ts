import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any
  }
}

export const authPlugin = fp(plugin)

async function plugin(instance: FastifyInstance) {
  instance.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('Hit an authenticated route')
    // Add your authentication logic here.
    // If the authentication fails, you can use `reply.status(401).send({ error: 'Unauthorized' })`
  })
}
