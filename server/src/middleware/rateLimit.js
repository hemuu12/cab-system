import mongoose from 'mongoose';
import SecurityRateLimit from '../models/SecurityRateLimit.js';
import { hashOpaqueToken } from '../utils/security.js';

const fallbackCounters = new Map();

function fallbackIncrement(key, windowMs) {
  const now = Date.now();
  const current = fallbackCounters.get(key);
  if (!current || current.expiresAt <= now) {
    const next = { count: 1, expiresAt: now + windowMs };
    fallbackCounters.set(key, next);
    return next;
  }
  current.count += 1;
  return current;
}

/** Mongo-backed in production so limits apply across serverless instances. */
export function rateLimit({ scope, max, windowMs, includeIdentity = false }) {
  return async (req, res, next) => {
    try {
      const identity = includeIdentity ? String(req.body?.email || '').trim().toLowerCase().slice(0, 254) : '';
      const key = hashOpaqueToken(`${scope}:${req.ip || 'unknown'}:${identity}`);
      let counter;

      if (mongoose.connection.readyState === 1) {
        const now = new Date();
        const existing = await SecurityRateLimit.findOne({ key }).lean();
        if (existing?.expiresAt <= now) await SecurityRateLimit.deleteOne({ key });
        counter = await SecurityRateLimit.findOneAndUpdate(
          { key },
          { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + windowMs) } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
      } else {
        counter = fallbackIncrement(key, windowMs);
      }

      const remaining = Math.max(0, max - counter.count);
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(remaining));
      res.setHeader('RateLimit-Reset', String(Math.ceil(new Date(counter.expiresAt).getTime() / 1000)));
      if (counter.count > max) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      next();
    } catch (error) {
      // A limiter outage must not become an application outage; retain local protection.
      const fallback = fallbackIncrement(hashOpaqueToken(`${scope}:${req.ip || 'unknown'}`), windowMs);
      if (fallback.count > max) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      next();
    }
  };
}
