import {route} from 'src/router/router';

export const helloWorld = route({
  auth: false,
  method: 'GET',
  url: '/',
  docs: {
    tag: 'home',
    operationId: 'helloWorld',
    description: 'Hello world',
  },
  schema: {},
  handle: async ({instance, req}) => {
    return;
  },
});
