import { buildApp } from './app.js';

const app = await buildApp();
try {
  await app.listen({ host: '0.0.0.0', port: Number(process.env.API_PORT ?? 3000) });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
