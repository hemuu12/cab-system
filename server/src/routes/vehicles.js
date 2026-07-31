import { Router } from 'express';
import { loadActiveVehicles, loadPricingClasses, loadVehicleById, quoteVehicle } from '../utils/pricing.js';

const router = Router();

/** Distance used for the indicative "starting from" price shown on listing pages. */
const SAMPLE_TRIP = { distanceKm: 250, tripType: 'one-way', days: 1 };

const withIndicativeFare = (vehicle, classes) => {
  try {
    const fare = quoteVehicle(SAMPLE_TRIP, vehicle, classes);
    return { ...vehicle, fare, indicativeFare: { forKm: SAMPLE_TRIP.distanceKm, perKm: fare.perKm, total: fare.total } };
  } catch {
    return { ...vehicle, fare: null, indicativeFare: null };
  }
};

router.get('/', async (_req, res, next) => {
  try {
    const [vehicles, classes] = await Promise.all([loadActiveVehicles(), loadPricingClasses()]);
    res.json(vehicles.map(vehicle => withIndicativeFare(vehicle, classes)));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [vehicle, classes] = await Promise.all([loadVehicleById(req.params.id), loadPricingClasses()]);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(withIndicativeFare(vehicle, classes));
  } catch (error) { next(error); }
});

export default router;
