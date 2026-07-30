import 'dotenv/config';
import app from '../src/app.js';
import { initializeDatabase } from '../src/database.js';

export default async function handler(req, res) {
  await initializeDatabase();
  return app(req, res);
}

