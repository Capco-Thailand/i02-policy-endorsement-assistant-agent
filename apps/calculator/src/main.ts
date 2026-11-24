import { buildCalculatorApp } from './server.js';

const app = buildCalculatorApp();
await app.listen({
  port: Number(process.env.CALCULATOR_PORT ?? 3002),
  host: process.env.CALCULATOR_HOST ?? '127.0.0.1',
});
