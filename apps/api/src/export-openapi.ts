import { buildApp } from './app.js';

const app = await buildApp();
process.stdout.write(JSON.stringify(app.swagger()));
await app.close();
