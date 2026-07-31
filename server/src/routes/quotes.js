import { Router } from 'express';
import { resolveDistance } from '../utils/distance.js';
import { daysBetween } from '../utils/fare.js';
import { loadActiveVehicles, loadPricingClasses, quoteFleet } from '../utils/pricing.js';

const router = Router();

const TRIP_TYPES = ['one-way', 'round-trip'];

function readPoint(value, field) {
  const lat = Number(value?.lat);
  const lon = Number(value?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw Object.assign(new Error(`Please choose a ${field} from the suggestions`), { status: 400 });
  }
  return { lat, lon, label: String(value.label || '').slice(0, 200), state: String(value.state || '').slice(0, 80) };
}

/** Prices the whole fleet for one trip. The client never sends a price — only where, when and how long. */
router.post('/', async (req, res, next) => {
  try {
    const { pickup, drop, tripType = 'one-way', date, returnDate, time } = req.body || {};
    if (!TRIP_TYPES.includes(tripType)) {
      return res.status(400).json({ message: 'Trip type must be one-way or round-trip' });
    }

    const from = readPoint(pickup, 'pickup location');
    const to = readPoint(drop, 'drop location');

    const { distanceKm, durationMin, source } = await resolveDistance(from, to);
    const days = tripType === 'round-trip' && date && returnDate ? daysBetween(date, returnDate) : 1;

    const trip = { distanceKm, tripType, days, time, fromState: from.state, toState: to.state };
    const [vehicles, classes] = await Promise.all([loadActiveVehicles(), loadPricingClasses()]);

    res.json({
      trip: {
        pickup: from.label,
        drop: to.label,
        tripType,
        date: date || null,
        returnDate: tripType === 'round-trip' ? returnDate || null : null,
        time: time || null,
        days,
        distanceKm,
        durationMin,
        // 'haversine' means the distance is a straight-line estimate — the UI should label it approximate.
        distanceSource: source
      },
      options: quoteFleet(trip, vehicles, classes)
    });
  } catch (error) { next(error); }
});

export default router;
