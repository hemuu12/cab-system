import { Router } from 'express';
import mongoose from 'mongoose';
import Route from '../models/Route.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const routes = await Route.find({ active: true }).sort({ region: 1, sortOrder: 1, destination: 1 }).lean();
    res.json(routes);
  } catch (error) { next(error); }
});

export default router;
