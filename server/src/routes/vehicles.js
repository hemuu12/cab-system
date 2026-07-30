import { Router } from 'express';
import Vehicle from '../models/Vehicle.js';
import { calculateFare } from '../utils/fare.js';
import mongoose from 'mongoose';
import { fleet } from '../data/fleet.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(fleet.map(vehicle => ({ ...vehicle, fare: calculateFare(vehicle) })));
    }
    const vehicles = await Vehicle.find({ active: true, pricingConfigured: { $ne: false } }).sort({ featured: -1, createdAt: 1, name: 1 }).lean();
    res.json(vehicles.map(vehicle => ({ ...vehicle, fare: calculateFare(vehicle) })));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const vehicle = fleet.find(item => item._id === req.params.id);
      if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
      return res.json({ ...vehicle, fare: calculateFare(vehicle) });
    }
    const vehicle = await Vehicle.findOne({ _id: req.params.id, active: true, pricingConfigured: { $ne: false } }).lean();
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ ...vehicle, fare: calculateFare(vehicle) });
  } catch (error) { next(error); }
});

export default router;
