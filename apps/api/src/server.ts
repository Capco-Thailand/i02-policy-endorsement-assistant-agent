import { buildApp } from './app.js';

const host = process.env.API_HOST ?? '127.0.0.1';
if (!['127.0.0.1', 'localhost', '::1'].includes(host) && (!process.env.DEMO_ALICE_PASSWORD || !process.env.DEMO_BOB_PASSWORD)) {
  throw new Error('Set both demo passwords before exposing the API beyond localhost');
}
const app = await buildApp();
try {
  await app.listen({ host, port: Number(process.env.API_PORT ?? 3000) });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
