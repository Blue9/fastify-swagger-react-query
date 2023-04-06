import dotenv from 'dotenv';
import app from './app';

dotenv.config();
const port = (process.env.PORT && parseInt(process.env.PORT)) || 4000;

const start = async () => {
  await app.listen({port, host: '0.0.0.0'});
};
start();
