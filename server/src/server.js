import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './database.js';

const port = process.env.PORT || 5001;

async function start() {
  await initializeDatabase();
  app.listen(port, () => console.log(`WonderTravel API running on http://localhost:${port}`));
}

start().catch(error => {
  console.error(`WonderTravel API failed to start: ${error?.message || 'Unknown startup error'}`);
  process.exitCode = 1;
});
