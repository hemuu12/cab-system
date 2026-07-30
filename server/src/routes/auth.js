import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import RefreshSession from '../models/RefreshSession.js';
import EmailOtp from '../models/EmailOtp.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/email.js';

const router = Router();
const refreshCookie = 'wondertravel_refresh';
const accessSecret = () => process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me';
const accessLifetime = process.env.JWT_ACCESS_TTL || '15m';
const refreshDays = Math.max(1, Number(process.env.JWT_REFRESH_DAYS) || 30);
const hashToken = token => createHash('sha256').update(token).digest('hex');
const safeUser = user => user.toSafeObject ? user.toSafeObject() : ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, active: user.active, emailVerified: user.emailVerified, accountStatus: user.accountStatus });
const signAccessToken = user => jwt.sign({ sub: String(user._id), role: user.role }, accessSecret(), { expiresIn: accessLifetime, algorithm: 'HS256', issuer: 'wondertravel-api', audience: 'wondertravel-web' });
const otpHash = (email, code) => createHash('sha256').update(`${email}:${code}:${process.env.OTP_SECRET || accessSecret()}`).digest();
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: refreshDays * 86400000,
  priority: 'high'
};

async function issueSession(user, req, res) {
  const refreshToken = randomBytes(48).toString('base64url');
  await RefreshSession.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshDays * 86400000),
    userAgent: req.get('user-agent') || '',
    ip: req.ip || ''
  });
  res.cookie(refreshCookie, refreshToken, cookieOptions);
  return { accessToken: signAccessToken(user), user: safeUser(user) };
}

const attempts = new Map();
function loginLimit(req, res, next) {
  const key = req.ip || 'local';
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, resetAt: now + 15 * 60000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 15 * 60000; }
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > 20) return res.status(429).json({ message: 'Too many sign-in attempts. Please try again later.' });
  next();
}

router.post('/register', loginLimit, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return res.status(400).json({ message: 'Enter your name, a valid email and a password of at least 8 characters' });
    }
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account already exists for this email' });
    const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/login', loginLimit, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user?.active || user.accountStatus === 'blocked' || !user.passwordHash || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    attempts.delete(req.ip || 'local');
    res.json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/otp/request', loginLimit, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Email verification requires the database connection' });
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    const user = await User.findOne({ email });
    const generic = { message: 'If that email is linked to an account, a verification code has been sent.' };
    if (!user?.active || user.accountStatus === 'blocked') return res.json(generic);

    const recent = await EmailOtp.findOne({ email, purpose: 'login', createdAt: { $gt: new Date(Date.now() - 60000) } }).sort({ createdAt: -1 }).lean();
    if (recent) return res.status(429).json({ message: 'Please wait one minute before requesting another code' });

    const code = String(randomInt(100000, 1000000));
    const otp = await EmailOtp.create({
      email,
      purpose: 'login',
      codeHash: otpHash(email, code).toString('hex'),
      expiresAt: new Date(Date.now() + 10 * 60000),
      requestedIp: req.ip || ''
    });
    try {
      const delivery = await sendOtpEmail({ email, code, name: user.name, purpose: 'login' });
      res.json({ ...generic, ...(delivery.development ? { developmentCode: code } : {}) });
    } catch (error) {
      await EmailOtp.deleteOne({ _id: otp._id });
      throw error;
    }
  } catch (error) { next(error); }
});

router.post('/otp/verify', loginLimit, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Email verification requires the database connection' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter the email and six-digit verification code' });
    }
    const otp = await EmailOtp.findOne({ email, purpose: 'login', consumedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp || otp.attempts >= 5) return res.status(400).json({ message: 'The verification code is invalid or has expired' });
    otp.attempts += 1;
    const suppliedHash = otpHash(email, code);
    const storedHash = Buffer.from(otp.codeHash, 'hex');
    if (storedHash.length !== suppliedHash.length || !timingSafeEqual(storedHash, suppliedHash)) {
      await otp.save();
      return res.status(400).json({ message: 'The verification code is invalid or has expired' });
    }
    otp.consumedAt = new Date();
    await otp.save();
    const user = await User.findOneAndUpdate(
      { email, active: true, accountStatus: { $ne: 'blocked' } },
      { $set: { emailVerified: true, accountStatus: 'active', lastLoginAt: new Date() } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'No account is linked to this email' });
    attempts.delete(req.ip || 'local');
    res.json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/password/forgot', loginLimit, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Password recovery is temporarily unavailable. Please try again shortly.' });
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    const generic = { message: 'If an account exists for this email, a reset code has been sent.' };
    const user = await User.findOne({ email });
    if (!user?.active || user.accountStatus === 'blocked') return res.json(generic);
    const recent = await EmailOtp.findOne({ email, purpose: 'password-reset', createdAt: { $gt: new Date(Date.now() - 60000) } }).lean();
    if (recent) return res.status(429).json({ message: 'A code was sent recently. Please wait one minute before trying again.' });

    const code = String(randomInt(100000, 1000000));
    const otp = await EmailOtp.create({
      email,
      purpose: 'password-reset',
      codeHash: otpHash(email, code).toString('hex'),
      expiresAt: new Date(Date.now() + 10 * 60000),
      requestedIp: req.ip || ''
    });
    try {
      const delivery = await sendOtpEmail({ email, code, name: user.name, purpose: 'password-reset' });
      res.json({ ...generic, ...(delivery.development ? { developmentCode: code } : {}) });
    } catch (error) {
      await EmailOtp.deleteOne({ _id: otp._id });
      throw error;
    }
  } catch (error) { next(error); }
});

router.post('/password/reset', loginLimit, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Password recovery is temporarily unavailable. Please try again shortly.' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ message: 'Enter your email and the six-digit reset code.' });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Use at least 8 characters with both a letter and a number.' });
    }
    const otp = await EmailOtp.findOne({ email, purpose: 'password-reset', consumedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otp || otp.attempts >= 5) return res.status(400).json({ message: 'That reset code is incorrect or has expired. Request a new code.' });
    otp.attempts += 1;
    const suppliedHash = otpHash(email, code);
    const storedHash = Buffer.from(otp.codeHash, 'hex');
    if (storedHash.length !== suppliedHash.length || !timingSafeEqual(storedHash, suppliedHash)) {
      await otp.save();
      return res.status(400).json({ message: 'That reset code is incorrect or has expired. Request a new code.' });
    }
    const user = await User.findOne({ email, active: true, accountStatus: { $ne: 'blocked' } });
    if (!user) return res.status(400).json({ message: 'This account cannot be recovered online. Please contact support.' });
    otp.consumedAt = new Date();
    user.passwordHash = await bcrypt.hash(password, 12);
    user.emailVerified = true;
    user.accountStatus = 'active';
    user.lastLoginAt = new Date();
    await Promise.all([otp.save(), user.save(), RefreshSession.deleteMany({ user: user._id })]);
    attempts.delete(req.ip || 'local');
    res.json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[refreshCookie];
    if (!token) return res.status(401).json({ message: 'No active session' });
    const session = await RefreshSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).populate('user');
    if (!session?.user?.active || session.user.accountStatus === 'blocked') {
      if (session) await RefreshSession.deleteOne({ _id: session._id });
      res.clearCookie(refreshCookie, cookieOptions);
      return res.status(401).json({ message: 'Session expired' });
    }
    session.lastUsedAt = new Date();
    await session.save();
    res.json({ accessToken: signAccessToken(session.user), user: safeUser(session.user) });
  } catch (error) { next(error); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[refreshCookie];
    if (token) await RefreshSession.deleteOne({ tokenHash: hashToken(token) });
    res.clearCookie(refreshCookie, cookieOptions);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await RefreshSession.deleteMany({ user: req.user._id });
    res.clearCookie(refreshCookie, cookieOptions);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: safeUser(req.user) }));

export default router;
