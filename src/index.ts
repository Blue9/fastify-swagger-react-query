import { app } from './app'

const start = async () => {
  app.listen({ port: 4000, host: '0.0.0.0' })
}
start()
