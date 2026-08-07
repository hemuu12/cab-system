import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import Route from './models/Route.js';
import PricingClass from './models/PricingClass.js';
import { fleet } from './data/fleet.js';
import { FEATURED_ROUTES } from './data/featuredRoutes.js';
import { validateSecurityConfiguration } from './utils/security.js';
import { PRICING_CLASSES } from './data/pricingClasses.js';

let initializationPromise;

async function connectAndSeed() {
  validateSecurityConfiguration();
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meridian_cabs',
      { serverSelectionTimeoutMS: 3000 }
    );
  }

  // Seeded only on a genuinely empty collection — this is starter data for a fresh
  // database, not a permanent sync source. An upsert-by-name here would otherwise
  // resurrect a vehicle the admin deleted on purpose the next time the server restarts.
  if (await Vehicle.countDocuments() === 0) {
    await Vehicle.insertMany(fleet);
  }

  await PricingClass.bulkWrite(PRICING_CLASSES.map(pricingClass => ({
    updateOne: {
      filter: { key: pricingClass.key },
      update: { $setOnInsert: pricingClass },
      upsert: true
    }
  })));

  // Vehicles created before rate cards existed fall back to their seat count.
  await Vehicle.updateMany(
    { pricingClass: { $exists: false }, seats: { $gt: 5 } },
    { $set: { pricingClass: '7-seater', rateMultiplier: 1 } }
  );
  await Vehicle.updateMany(
    { pricingClass: { $exists: false } },
    { $set: { pricingClass: '5-seater', rateMultiplier: 1 } }
  );
  await Vehicle.updateMany({ perKmDelta: { $exists: false } }, { $set: { perKmDelta: 0 } });

  // Same reasoning as the vehicle seed above: only populate an empty collection, so a
  // route the admin deleted stays deleted across restarts.
  if (await Route.countDocuments() === 0) {
    await Route.insertMany(FEATURED_ROUTES.map((route, index) => ({ ...route, sortOrder: index, active: true })));
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    console.warn('JWT_ACCESS_SECRET is not set; using development-only fallback.');
  }
}

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = connectAndSeed().catch(error => {
      initializationPromise = undefined;
      if (process.env.NODE_ENV === 'production') throw error;
      console.warn(`MongoDB unavailable (${error.message}). Using temporary in-memory data.`);
      return false;
    });
  }

  const result = await initializationPromise;
  return result !== false;
}
