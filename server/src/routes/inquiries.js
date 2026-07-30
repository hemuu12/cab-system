import { Router } from 'express';
import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';
import { memoryInquiries } from '../data/memoryStore.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { type, name, phone, email = '', city, message = '' } = req.body;
    if (!['fleet-partner', 'chauffeur', 'support'].includes(type) || !name?.trim() || !phone?.trim() || !city?.trim()) {
      return res.status(400).json({ message: 'Please provide your name, phone number and city' });
    }
    const details = { type, name: name.trim(), phone: phone.trim(), email: email.trim().toLowerCase(), city: city.trim(), message: message.trim(), status: 'new' };
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
