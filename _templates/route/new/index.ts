import {camelCase} from 'change-case';
import fs from 'fs';

export default [
  {
    type: 'input',
    name: 'description',
    message: 'Write documentation for this route:',
  },
  {
    type: 'confirm',
    name: 'auth',
    message: 'Is this route authenticated?',
    initial: 'Y',
  },
  {
    type: 'input',
    name: 'feature',
    message: `What feature is this for?`,
    validate: async function (input: string) {
      const featurePath = `src/modules/${camelCase(input)}`;
      try {
        await fs.promises.access(featurePath);
        return true;
      } catch (err) {
        return `Could not find ${featurePath}. Make sure the feature exists and that you have spelled it correctly.`;
      }
    },
    result: camelCase,
  },
  {
    type: 'input',
    name: 'operationId',
    message: "What is this route's operationId (e.g. getXDetails)?",
    result: camelCase,
  },
  {
    type: 'select',
    name: 'method',
    message: "What is the route's method?",
    choices: ['GET', 'POST', 'PUT', 'DELETE'],
    initial: 'GET',
  },
  {
    type: 'input',
    name: 'path',
    message: "What is the route's path? You can use `:param` to specify URL params.",
    initial: '/',
    validate: async function (input: string) {
      return input.startsWith('/') || 'Route must begin with `/`';
    },
  },
];
