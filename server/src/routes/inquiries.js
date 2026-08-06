import { Router } from 'express';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import Inquiry from '../models/Inquiry.js';
import { memoryInquiries } from '../data/memoryStore.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { sendQuickBookingEmail } from '../utils/email.js';
import { publishAdminActivity } from '../utils/realtime.js';

const router = Router();

/** Short, easy-to-read reference the customer can quote when we follow up. */
const generateReference = () => `WT-${randomBytes(3).toString('hex')}`.toUpperCase();

router.post('/', rateLimit({ scope: 'inquiry-create', max: 10, windowMs: 60 * 60 * 1000 }), async (req, res, next) => {
  try {
    const type = String(req.body?.type || '');
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const phone = String(req.body?.phone || '').trim().slice(0, 20);
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 120);
    const isQuickBooking = type === 'quick-booking';

    if (isQuickBooking) {
      const pickup = String(req.body?.pickup || '').trim().slice(0, 120);
      const drop = String(req.body?.drop || '').trim().slice(0, 120);
      const travelDate = String(req.body?.travelDate || '').trim().slice(0, 20);
      if (name.length < 2 || !pickup || !drop || !travelDate) {
        return res.status(400).json({ message: 'Please provide your name, both locations and a travel date' });
      }
      const reference = generateReference();
      const details = {
        type,
        name,
        phone: phone || 'Not provided',
        email,
        city: `${pickup} → ${drop}`,
        message: `Reference ${reference} · Travel date ${travelDate}`,
        status: 'new'
      };
      let inquiry;
      if (mongoose.connection.readyState !== 1) {
        inquiry = { _id: `local-${Date.now()}`, ...details, createdAt: new Date().toISOString() };
        memoryInquiries.push(inquiry);
      } else {
        inquiry = await Inquiry.create(details);
      }
      sendQuickBookingEmail({ reference, name, phone: details.phone, pickup, drop, travelDate }).catch(() => {});
      await publishAdminActivity({
        id: `inquiry:${inquiry._id}:created`, type: 'inquiry', section: 'Inquiries',
        title: 'New quick-booking request', message: `${name}: ${pickup} to ${drop}`,
        at: inquiry.createdAt
      });
      return res.status(201).json({ message: 'Thank you. Our team will contact you shortly.', reference, inquiry });
    }

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
      await publishAdminActivity({
        id: `inquiry:${inquiry._id}:created`, type: 'inquiry', section: 'Inquiries',
        title: 'New customer inquiry', message: `${name} sent a ${type.replace('-', ' ')} request.`,
        at: inquiry.createdAt
      });
      return res.status(201).json({ message: 'Thank you. Our team will contact you shortly.', inquiry });
    }
    const inquiry = await Inquiry.create(details);
    await publishAdminActivity({
      id: `inquiry:${inquiry._id}:created`, type: 'inquiry', section: 'Inquiries',
      title: 'New customer inquiry', message: `${name} sent a ${type.replace('-', ' ')} request.`,
      at: inquiry.createdAt
    });
    res.status(201).json({ message: 'Thank you. Our team will contact you shortly.', inquiry });
  } catch (error) { next(error); }
});

export default router;
