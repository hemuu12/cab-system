import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './database.js';

const port = process.env.PORT || 5001;

async function start() {
  app.listen(port, () => console.log(`WonderTravel API running on http://localhost:${port}`));
  await initializeDatabase();
}

start();
