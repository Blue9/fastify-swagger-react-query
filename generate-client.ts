import { app } from 'src/app'
import fs from 'fs'
import orval from 'orval'

const OPENAPI_PATH = './openapi.tmp.json'

async function generateClient() {
  await app.ready()
  const openapiSpec = app.swagger()
  await fs.promises.writeFile(
    OPENAPI_PATH,
    JSON.stringify(openapiSpec, null, 2)
  )
  await orval({
    input: OPENAPI_PATH,
    output: {
      client: 'react-query',
      workspace: './generated_client',
      schemas: './models',
      target: './client',
      mode: 'tags-split',
      override: {
        useDates: true,
      },
    },
    hooks: {
      afterAllFilesWrite: ['prettier --write'],
    },
  })
  await fs.promises.unlink(OPENAPI_PATH)
}

generateClient()
