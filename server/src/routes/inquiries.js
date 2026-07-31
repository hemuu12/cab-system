import { Router } from 'express';
import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';
import { memoryInquiries } from '../data/memoryStore.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', rateLimit({ scope: 'inquiry-create', max: 10, windowMs: 60 * 60 * 1000 }), async (req, res, next) => {
  try {
    const type = String(req.body?.type || '');
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const phone = String(req.body?.phone || '').trim().slice(0, 20);
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 120);
    const city = String(req.body?.city || '').trim().slice(0, 80);
    const message = String(req.body?.message || '').trim().slice(0, 500);
    if (!['fleet-partner', 'chauffeur', 'support'].includes(type) || name.length < 2 || !/^[+\d][\d\s()-]{6,19}$/.test(phone) || city.length < 2) {
      return res.status(400).json({ message: 'Please provide your name, phone number and city' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const details = { type, name, phone, email, city, message, status: 'new' };
    if (mongoose.connection.readyState !== 1) {
      const inquiry = { _id: `local-${Date.now()}`, ...details, createdAt: new Date().toISOString() };
      memoryInquiries.push(inquiry);
      return res.status(201).json({ message: 'Thank you. Our team will contact you shortly.', inquiry });
    }
    const inquiry = await Inquiry.create(details);
    res.status(201).json({ message: 'Thank you. Our team will contact you shortly.', inquiry });
  } catch (error) { next(error); }
});

export default router;
