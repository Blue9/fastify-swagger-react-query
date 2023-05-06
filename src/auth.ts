import { FastifyRequest, FastifyReply } from 'fastify'

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('Hit an authenticated route')
  // Add your authentication logic here.
  reply.status(401).send({ error: 'Unauthorized (Auth unimplemented)' })
}
