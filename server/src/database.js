import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import Route from './models/Route.js';
import { fleet } from './data/fleet.js';
import { DELHI_ROUTES } from './data/delhiRoutes.js';

let initializationPromise;

async function connectAndSeed() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meridian_cabs',
      { serverSelectionTimeoutMS: 3000 }
    );
  }

  await Vehicle.bulkWrite(fleet.map(({ _id, ...vehicle }) => ({
    updateOne: {
      filter: { name: vehicle.name },
      update: { $setOnInsert: { _id, ...vehicle } },
      upsert: true
    }
  })));

  await Route.bulkWrite(DELHI_ROUTES.map((route, index) => ({
    updateOne: {
      filter: { destination: route.destination },
      update: { $setOnInsert: { ...route, sortOrder: index, active: true } },
      upsert: true
    }
  })));

  if (!process.env.JWT_ACCESS_SECRET) {
    console.warn('JWT_ACCESS_SECRET is not set; using development-only fallback.');
  }
}

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = connectAndSeed().catch(error => {
      initializationPromise = undefined;
      console.warn(`MongoDB unavailable (${error.message}). Using temporary in-memory data.`);
      return false;
    });
  }

  const result = await initializationPromise;
  return result !== false;
}
