import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from './app.js';
import Vehicle from './models/Vehicle.js';
import Route from './models/Route.js';
import User from './models/User.js';
import { fleet } from './data/fleet.js';
import { DELHI_ROUTES } from './data/delhiRoutes.js';

const port = process.env.PORT || 5001;

async function start() {
  app.listen(port, () => console.log(`WonderTravel API running on http://localhost:${port}`));
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meridian_cabs', { serverSelectionTimeoutMS: 3000 });
    await Vehicle.bulkWrite(fleet.map(({ _id, ...vehicle }) => ({
      updateOne: { filter: { name: vehicle.name }, update: { $setOnInsert: { _id, ...vehicle } }, upsert: true }
    })));
    await Route.bulkWrite(DELHI_ROUTES.map((route, index) => ({
      updateOne: { filter: { destination: route.destination }, update: { $setOnInsert: { ...route, sortOrder: index, active: true } }, upsert: true }
    })));
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
      await User.updateOne(
        { email },
        { $set: { name: process.env.ADMIN_NAME || 'WonderTravel Admin', role: 'admin', active: true, accountStatus: 'active', emailVerified: true, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) }, $setOnInsert: { email, createdFrom: 'admin' } },
        { upsert: true }
      );
    } else {
      console.warn('ADMIN_EMAIL / ADMIN_PASSWORD are not set; no admin account was bootstrapped.');
    }
    if (!process.env.JWT_ACCESS_SECRET) console.warn('JWT_ACCESS_SECRET is not set; using development-only fallback.');
  } catch (error) {
    console.warn(`MongoDB unavailable (${error.message}). Using temporary in-memory data.`);
  }
}

start();
