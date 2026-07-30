import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Feedback from '../models/Feedback.js';
import { deleteImage, isCloudinaryConfigured, uploadImage } from '../utils/cloudinary.js';

const router = Router();
const attempts = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
const clean = (value, max) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)
    ? callback(null, true)
    : callback(Object.assign(new Error('Upload a JPG, PNG, WebP or AVIF image'), { status: 400 }))
});

function feedbackLimit(req, res, next) {
  const key = req.ip || 'local';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS) {
    attempts.set(key, recent);
    return res.status(429).json({ message: 'You have shared several reviews recently. Please try again later.' });
  }
  recent.push(now);
  attempts.set(key, recent);
  next();
}

router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const rows = await Feedback.find({ status: 'approved', consentToPublish: true })
      .select('name city tripLabel rating message photo featured approvedAt createdAt')
      .sort({ featured: -1, approvedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(rows);
  } catch (error) { next(error); }
});

router.post('/', feedbackLimit, photoUpload.single('photo'), async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Feedback storage is temporarily unavailable. Please try again shortly.' });
    }
    if (clean(req.body.website, 120)) return res.status(201).json({ message: 'Thank you for your feedback.' });
    const startedAt = Number(req.body.startedAt);
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1500) {
      return res.status(400).json({ message: 'Please take a moment to review your feedback before sending it.' });
    }

    const name = clean(req.body.name, 80);
    const email = clean(req.body.email, 120).toLowerCase();
    const city = clean(req.body.city, 80);
    const tripLabel = clean(req.body.tripLabel, 120);
    const message = clean(req.body.message, 800);
    const rating = Number(req.body.rating);
    const consentToPublish = req.body.consentToPublish === true || req.body.consentToPublish === 'true' || req.body.consentToPublish === 'on';
    if (name.length < 2) return res.status(400).json({ message: 'Please enter your name.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address or leave it blank.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
    if (message.length < 15) return res.status(400).json({ message: 'Please share at least a few words about your experience.' });
    if (!consentToPublish) return res.status(400).json({ message: 'Please confirm that WonderTravel may publish your review.' });

    let photo;
    if (req.file) {
      if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Photo uploads are temporarily unavailable. Remove the photo or try again shortly.' });
      const result = await uploadImage(req.file.buffer, {
        folder: 'wondertravel/feedback',
        transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
      });
      photo = {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        alt: `${name}'s WonderTravel experience`
      };
    }
    let item;
    try {
      item = await Feedback.create({ name, email, city, tripLabel, rating, message, photo, consentToPublish });
    } catch (error) {
      if (photo?.publicId) await deleteImage(photo.publicId).catch(() => {});
      throw error;
    }
    res.status(201).json({
      id: item._id,
      message: 'Thank you. Your feedback was saved and will appear after our team reviews it.'
    });
  } catch (error) { next(error); }
});

export default router;
