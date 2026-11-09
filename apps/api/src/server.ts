import { buildApp } from './app.js';

function readPort(value: string | undefined): number {
  if (value === undefined) return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535');
  }
  return port;
}

const app = await buildApp();

try {
  await app.listen({
    host: process.env.HOST ?? '127.0.0.1',
    port: readPort(process.env.PORT),
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
  await app.close();
}
