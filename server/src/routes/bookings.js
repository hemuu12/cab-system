import { Router } from 'express';
import { randomBytes } from 'crypto';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { loadPricingClasses, quoteVehicle } from '../utils/pricing.js';
import { resolveDistance } from '../utils/distance.js';
import mongoose from 'mongoose';
import { fleet } from '../data/fleet.js';
import { memoryBookings } from '../data/memoryStore.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { hashOpaqueToken, safeTokenMatch } from '../utils/security.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const hasCoords = point => {
  const lat = Number(point?.lat);
  const lon = Number(point?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};
const createReference = () => `WTR-${randomBytes(8).toString('hex').toUpperCase()}`;
const createBookingAccess = () => {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashOpaqueToken(token) };
};
const cleanBooking = booking => {
  const value = booking?.toObject ? booking.toObject() : { ...booking };
  delete value.accessTokenHash;
  delete value._accessTokenHash;
  return value;
};

/**
 * Recomputes the fare from the trip and the chosen vehicle. The client only says where it is
 * going and in what — never what it costs — so a tampered price cannot reach a booking.
 */
async function priceBooking({ pickupPoint, dropPoint, tripType, travelDays, time }, vehicle) {
  if (!hasCoords(pickupPoint) || !hasCoords(dropPoint)) {
    throw Object.assign(new Error('Choose both locations from the address suggestions so the fare can be verified'), { status: 400 });
  }
  const resolved = await resolveDistance(pickupPoint, dropPoint);
  const resolvedKm = resolved.distanceKm;
  const fromState = String(pickupPoint.state || '').slice(0, 80);
  const toState = String(dropPoint.state || '').slice(0, 80);

  const classes = await loadPricingClasses();
  return quoteVehicle(
    { distanceKm: resolvedKm, tripType: tripType === 'round-trip' ? 'round-trip' : 'one-way', days: travelDays, time, fromState, toState },
    vehicle,
    classes
  );
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const email = req.user.email.toLowerCase();
    if (mongoose.connection.readyState !== 1) {
      const bookings = memoryBookings.filter(item => item.passenger.email === email);
      return res.json([...bookings].reverse());
    }
    const bookings = await Booking.find({ $or: [{ customer: req.user._id }, { 'passenger.email': email }] }).populate('vehicle').sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (error) { next(error); }
});

router.get('/:reference', optionalAuthenticate, async (req, res, next) => {
  try {
    const accessToken = req.get('x-booking-token') || '';
    if (mongoose.connection.readyState !== 1) {
      const booking = memoryBookings.find(item => item.reference === req.params.reference);
      const ownsBooking = req.user && (req.user.role === 'admin' || booking?.passenger?.email === req.user.email);
      if (!booking || (!ownsBooking && !safeTokenMatch(accessToken, booking._accessTokenHash))) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      return res.json(cleanBooking(booking));
    }
    const booking = await Booking.findOne({ reference: req.params.reference }).select('+accessTokenHash').populate('vehicle').lean();
    const ownsBooking = req.user && (
      req.user.role === 'admin' ||
      String(booking?.customer || '') === String(req.user._id) ||
      (booking?.passenger?.email && booking.passenger.email === req.user.email)
    );
    if (!booking || (!ownsBooking && !safeTokenMatch(accessToken, booking.accessTokenHash))) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(cleanBooking(booking));
  } catch (error) { next(error); }
});

router.post('/', rateLimit({ scope: 'booking-create', max: 15, windowMs: 60 * 60 * 1000 }), async (req, res, next) => {
  try {
    const { pickup, destination, date, time, tripType, serviceMode, travelDays, vehicleId, passenger, paymentMethod, pickupPoint, dropPoint } = req.body;
    if (!pickup || !destination || !date || !time || !vehicleId || !passenger?.name || !passenger?.phone) {
      return res.status(400).json({ message: 'Please complete all required booking fields' });
    }
    const cleanPickup = String(pickup).trim().slice(0, 200);
    const cleanDestination = String(destination).trim().slice(0, 200);
    const cleanName = String(passenger.name).trim().slice(0, 80);
    const email = String(passenger.email || '').trim().toLowerCase();
    const phone = String(passenger.phone).trim();
    const phoneDigits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (cleanName.length < 2) return res.status(400).json({ message: 'Please enter a valid passenger name' });
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address or leave it blank' });
    const normalizedPhone = `+91${phoneDigits}`;
    const normalizedPassenger = {
      name: cleanName,
      phone: normalizedPhone,
      email,
      notes: String(passenger.notes || '').trim().slice(0, 500)
    };
    if (!['one-way', 'round-trip', 'outstation'].includes(tripType)) return res.status(400).json({ message: 'Choose a valid trip type' });
    if (serviceMode !== 'chauffeur') return res.status(400).json({ message: 'Choose a supported service mode' });
    if (paymentMethod !== 'cash') return res.status(400).json({ message: 'Choose a valid payment method' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || Number.isNaN(new Date(`${date}T${time}`).valueOf()) || new Date(`${date}T${time}`) < new Date()) {
      return res.status(400).json({ message: 'Please choose a valid future pickup date and time' });
    }
    if (!hasCoords(pickupPoint) || !hasCoords(dropPoint)) return res.status(400).json({ message: 'Choose both locations from the address suggestions' });
    const access = createBookingAccess();
    if (mongoose.connection.readyState !== 1) {
      const vehicle = fleet.find(item => item._id === vehicleId);
      if (!vehicle) return res.status(404).json({ message: 'Selected vehicle is unavailable' });
      const days = Math.min(30, Math.max(1, Number(travelDays) || 1));
      const fare = await priceBooking({ pickupPoint, dropPoint, tripType, travelDays: days, time }, vehicle);
      const booking = {
        reference: createReference(), _accessTokenHash: access.tokenHash,
        pickup: cleanPickup, destination: cleanDestination, date, time, distanceKm: fare.distanceKm, travelDays: days,
        tripType: tripType || 'one-way', serviceMode: serviceMode || 'chauffeur', vehicle,
        passenger: normalizedPassenger, paymentMethod: 'cash',
        fare, status: 'confirmed', createdAt: new Date().toISOString()
      };
      memoryBookings.push(booking);
      return res.status(201).json({ ...cleanBooking(booking), accessToken: access.token });
    }
    const vehicle = await Vehicle.findOne({ _id: vehicleId, active: true, pricingConfigured: { $ne: false } });
    if (!vehicle) return res.status(404).json({ message: 'Selected vehicle is unavailable' });
    let customer = null;
    if (email) {
      customer = await User.findOne({ email });
      if (!customer) {
        customer = await User.create({
          name: cleanName,
          email,
          phone: normalizedPhone,
          accountStatus: 'provisional',
          createdFrom: 'booking',
          emailVerified: false
        });
      } else {
        if (!customer.phone) customer.phone = normalizedPhone;
        if (!customer.name) customer.name = cleanName;
        await customer.save();
      }
    }
    const reference = createReference();
    const days = Math.min(30, Math.max(1, Number(travelDays) || 1));
    const fare = await priceBooking({ pickupPoint, dropPoint, tripType, travelDays: days, time }, vehicle.toObject());
    const booking = await Booking.create({
      reference, accessTokenHash: access.tokenHash, pickup: cleanPickup, destination: cleanDestination, date, time,
      distanceKm: fare.distanceKm,
      travelDays: days,
      tripType, serviceMode, customer: customer?._id, vehicle: vehicle._id, passenger: normalizedPassenger, paymentMethod: 'cash', fare
    });
    await booking.populate('vehicle');
    res.status(201).json({ ...cleanBooking(booking), accessToken: access.token });
  } catch (error) { next(error); }
});

router.patch('/:reference/cancel', authenticate, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const booking = memoryBookings.find(item => item.reference === req.params.reference && item.passenger.email === req.user.email && !['completed', 'cancelled'].includes(item.status));
      if (!booking) return res.status(404).json({ message: 'Booking cannot be cancelled' });
      booking.status = 'cancelled';
      return res.json(booking);
    }
    const booking = await Booking.findOneAndUpdate(
      { reference: req.params.reference, $or: [{ customer: req.user._id }, { 'passenger.email': req.user.email }], status: { $nin: ['completed', 'cancelled'] } },
      { status: 'cancelled' },
      { new: true }
    ).populate('vehicle');
    if (!booking) return res.status(404).json({ message: 'Booking cannot be cancelled' });
    res.json(booking);
  } catch (error) { next(error); }
});

export default router;
