import fastify from 'fastify';
import pino from 'pino';
import {TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
import swagger, {SwaggerOptions} from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import * as modules from './modules';
import schemas from './schemas';

// Set up TypeBox for typing
const app = fastify({
  logger: pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss',
      },
    },
  }),
  disableRequestLogging: true,
}).withTypeProvider<TypeBoxTypeProvider>();

if (process.env.NODE_ENV === 'local') {
  app.addHook('onResponse', (req, reply, done) => {
    req.log.info(
      {
        method: req.method,
        statusCode: reply.raw.statusCode,
        requestParams: req.params,
        requestBody: JSON.stringify(req.body),
      },
      req.url,
    );
    done();
  });
} else {
  app.addHook('onResponse', (req, reply, done) => {
    req.log.info(
      {
        method: req.method,
        statusCode: reply.raw.statusCode,
      },
      req.url,
    );
    done();
  });
}

// Set up Swagger for documentation
const swaggerOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: 'Zinnia Mobile API',
      version: '0.0.1',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{bearerAuth: []}],
  },
  refResolver: {
    // By default Fastify swagger will auto-generate IDs for schemas in the
    // form def-0, def-1, etc. (When we specify $id on our schemas, it's used
    // as the title for the schema which is different than the ID). This code
    // tells Swagger to use the schema titles as the IDs (improves readability
    // of OpenAPI spec and generated code).
    // Comment this out and head to the /docs/json endpoint to see the difference.
    buildLocalReference: (json, _baseUri, _fragment, i) => `${json.$id}` || `def-${i}`,
  },
};
app.register(swagger, swaggerOptions);
app.register(swaggerUI, {
  routePrefix: '/docs',
});

// Add schemas
for (const schema of Object.values(schemas)) {
  app.addSchema(schema);
}

// Register all routers
app.register(modules.homeModule, {prefix: '/home'});
// mark-routers

export default app;
