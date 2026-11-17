import { database } from './db.js';
const db = database();
try {
  await db.seed();
} finally {
  await db.close();
}
