import { buildApp } from './app.js';

const app = await buildApp();
await app.listen({
  port: Number(process.env.API_PORT ?? 3000),
  host: '0.0.0.0',
});
