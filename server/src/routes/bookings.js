import { Router } from 'express';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { calculateFare } from '../utils/fare.js';
import mongoose from 'mongoose';
import { fleet } from '../data/fleet.js';
import { memoryBookings } from '../data/memoryStore.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

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

router.get('/:reference', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const booking = memoryBookings.find(item => item.reference === req.params.reference);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      return res.json(booking);
    }
    const booking = await Booking.findOne({ reference: req.params.reference }).populate('vehicle').lean();
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { pickup, destination, date, time, tripType, serviceMode, distanceKm, travelDays, vehicleId, passenger, paymentMethod } = req.body;
    if (!pickup || !destination || !date || !time || !vehicleId || !passenger?.name || !passenger?.phone) {
      return res.status(400).json({ message: 'Please complete all required booking fields' });
    }
    const cleanName = String(passenger.name).trim();
    const email = String(passenger.email || '').trim().toLowerCase();
    const phone = String(passenger.phone).trim();
    const phoneDigits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (cleanName.length < 2) return res.status(400).json({ message: 'Please enter a valid passenger name' });
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address or leave it blank' });
    const normalizedPhone = `+91${phoneDigits}`;
    const normalizedPassenger = { ...passenger, name: cleanName, phone: normalizedPhone, email };
    if (new Date(`${date}T${time}`) < new Date()) return res.status(400).json({ message: 'Please choose a future pickup date and time' });
    if (mongoose.connection.readyState !== 1) {
      const vehicle = fleet.find(item => item._id === vehicleId);
      if (!vehicle) return res.status(404).json({ message: 'Selected vehicle is unavailable' });
      const booking = {
        reference: `WTR-${Date.now().toString().slice(-9)}`,
        pickup, destination, date, time, distanceKm: Math.max(1, Number(distanceKm) || 235), travelDays: Math.min(30, Math.max(1, Number(travelDays) || 1)),
        tripType: tripType || 'one-way', serviceMode: serviceMode || 'chauffeur', vehicle,
        passenger: normalizedPassenger, paymentMethod: paymentMethod || 'upi',
        fare: calculateFare(vehicle), status: 'confirmed', createdAt: new Date().toISOString()
      };
      memoryBookings.push(booking);
      return res.status(201).json(booking);
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
    const reference = `WTR-${Date.now().toString().slice(-9)}`;
    const booking = await Booking.create({
      reference, pickup, destination, date, time,
      distanceKm: Math.max(1, Number(distanceKm) || 235),
      travelDays: Math.min(30, Math.max(1, Number(travelDays) || 1)),
      tripType, serviceMode, customer: customer?._id, vehicle: vehicle._id, passenger: normalizedPassenger, paymentMethod, fare: calculateFare(vehicle)
    });
    await booking.populate('vehicle');
    res.status(201).json(booking);
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
