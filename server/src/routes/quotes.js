import { Router } from 'express';
import { resolveDistance } from '../utils/distance.js';
import { daysBetween } from '../utils/fare.js';
import { resolveHillKm } from '../utils/hillZones.js';
import { loadActiveVehicles, loadPricingClasses, quoteFleet } from '../utils/pricing.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const TRIP_TYPES = ['one-way', 'round-trip'];

function readPoint(value, field) {
  const lat = Number(value?.lat);
  const lon = Number(value?.lon);
  // Bounds matter beyond correctness: these coordinates are interpolated into an
  // outbound routing URL, so anything outside the real world is rejected here.
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw Object.assign(new Error(`Please choose a ${field} from the suggestions`), { status: 400 });
  }
  return { lat, lon, label: String(value.label || '').slice(0, 200), state: String(value.state || '').slice(0, 80) };
}

/** Prices the whole fleet for one trip. The client never sends a price — only where, when and how long. */
router.post('/', rateLimit({ scope: 'quote', max: 60, windowMs: 15 * 60 * 1000 }), async (req, res, next) => {
  try {
    const { pickup, drop, tripType = 'one-way', date, returnDate, time } = req.body || {};
    if (!TRIP_TYPES.includes(tripType)) {
      return res.status(400).json({ message: 'Trip type must be one-way or round-trip' });
    }

    const from = readPoint(pickup, 'pickup location');
    const to = readPoint(drop, 'drop location');

    // Only well-formed values are echoed back, so nothing arbitrary is reflected to the caller.
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : null;
    const safeReturnDate = /^\d{4}-\d{2}-\d{2}$/.test(String(returnDate)) ? String(returnDate) : null;
    const safeTime = /^\d{2}:\d{2}$/.test(String(time)) ? String(time) : null;

    const { distanceKm, durationMin, source } = await resolveDistance(from, to);
    const days = tripType === 'round-trip' && safeDate && safeReturnDate ? daysBetween(safeDate, safeReturnDate) : 1;
    const hillKm = await resolveHillKm(to, distanceKm);

    const trip = { distanceKm, tripType, days, time: safeTime, fromState: from.state, toState: to.state, hillKm };
    const [vehicles, classes] = await Promise.all([loadActiveVehicles(), loadPricingClasses()]);

    res.json({
      trip: {
        pickup: from.label,
        drop: to.label,
        tripType,
        date: safeDate,
        returnDate: tripType === 'round-trip' ? safeReturnDate : null,
        time: safeTime,
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
