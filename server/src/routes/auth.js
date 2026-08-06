import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import RefreshSession from '../models/RefreshSession.js';
import EmailOtp from '../models/EmailOtp.js';
import User from '../models/User.js';
import { adminPermissionsFor, adminSectionsFor, authenticate } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/email.js';
import { accessSecret, otpSecret, TOKEN_AUDIENCE, TOKEN_ISSUER } from '../utils/security.js';
import { requireTrustedOrigin } from '../utils/origins.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { publishAdminActivity } from '../utils/realtime.js';

const router = Router();
const refreshCookie = process.env.NODE_ENV === 'production' ? '__Secure-wondertravel_refresh' : 'wondertravel_refresh';
const legacyRefreshCookie = 'wondertravel_refresh';
const accessLifetime = process.env.JWT_ACCESS_TTL || '15m';
const refreshDays = Math.max(1, Number(process.env.JWT_REFRESH_DAYS) || 30);
const hashToken = token => createHash('sha256').update(token).digest('hex');
const dummyPasswordHash = bcrypt.hashSync('wondertravel-invalid-password', 12);
const safeUser = user => {
  const safe = user.toSafeObject
    ? user.toSafeObject()
    : {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminRole: user.role === 'admin' ? (user.adminRole || 'admin') : undefined,
        active: user.active,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus
      };
  return safe.role === 'admin'
    ? { ...safe, permissions: adminPermissionsFor(user), adminSections: adminSectionsFor(user) }
    : safe;
};
const signAccessToken = user => jwt.sign(
  { sub: String(user._id), role: user.role, ...(user.role === 'admin' ? { adminRole: user.adminRole || 'admin' } : {}) },
  accessSecret(),
  { expiresIn: accessLifetime, algorithm: 'HS256', issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE }
);
const otpHash = (email, code) => createHash('sha256').update(`${email}:${code}:${otpSecret()}`).digest();
const cookieOptions = {
  httpOnly: true,
  // 'lax' in both environments: the Next.js rewrite proxy (next.config.mjs)
  // makes every /api request same-origin from the browser's point of view,
  // so this cookie is never actually cross-site — 'none' was a leftover from
  // before the proxy existed. Mobile Safari/PWA contexts are stricter about
  // SameSite=None cookies (they can be dropped on relaunch without extra
  // attributes like Partitioned), which was silently logging out PWA users
  // on refresh even though the same cookie survived fine on desktop Chrome.
  // NOTE: this only holds while the client calls the API via the relative
  // path '/api'. If NEXT_PUBLIC_API_BASE_URL is ever set to the backend's
  // absolute URL, the proxy is bypassed, the response becomes genuinely
  // cross-site, and the browser silently drops this cookie.
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  // Must be '/' (not '/api/auth'): the Next.js middleware reads this cookie
  // on ordinary page navigations (e.g. GET /admin) to gate protected routes.
  // A path scoped to /api/auth is never sent on those requests, so the
  // middleware always sees "no session" and redirects back to /login even
  // for a genuinely logged-in user — an infinite login<->admin bounce.
  path: '/',
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
  const staleSessions = await RefreshSession.find({ user: user._id }).sort({ createdAt: -1 }).skip(10).select('_id').lean();
  if (staleSessions.length) await RefreshSession.deleteMany({ _id: { $in: staleSessions.map(item => item._id) } });
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

const distributedAuthIpLimit = rateLimit({ scope: 'auth-ip', max: 50, windowMs: 15 * 60 * 1000 });
const distributedAuthIdentityLimit = rateLimit({ scope: 'auth-identity', max: 10, windowMs: 15 * 60 * 1000, includeIdentity: true });
const authLimits = [distributedAuthIpLimit, distributedAuthIdentityLimit, loginLimit];

router.post('/register', ...authLimits, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim();
    if (name.length < 2 || name.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Enter your name, a valid email and a 12–128 character password containing letters and numbers' });
    }
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account already exists for this email' });
    const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12) });
    await publishAdminActivity({
      id: `user:${user._id}:created`, type: 'user', section: 'Users',
      title: 'New customer account', message: `${name} created a WonderTravel account.`,
      at: user.createdAt
    });
    res.status(201).json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/login', ...authLimits, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').slice(0, 129);
    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash || dummyPasswordHash);
    if (!user?.active || user.accountStatus === 'blocked' || !user.passwordHash || !passwordMatches) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    attempts.delete(req.ip || 'local');
    res.json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/otp/request', ...authLimits, async (req, res, next) => {
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
      res.json({ ...generic, ...(delivery.development && process.env.NODE_ENV !== 'production' ? { developmentCode: code } : {}) });
    } catch (error) {
      await EmailOtp.deleteOne({ _id: otp._id });
      throw error;
    }
  } catch (error) { next(error); }
});

router.post('/otp/verify', ...authLimits, async (req, res, next) => {
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

router.post('/password/forgot', ...authLimits, async (req, res, next) => {
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
      res.json({ ...generic, ...(delivery.development && process.env.NODE_ENV !== 'production' ? { developmentCode: code } : {}) });
    } catch (error) {
      await EmailOtp.deleteOne({ _id: otp._id });
      throw error;
    }
  } catch (error) { next(error); }
});

router.post('/password/reset', ...authLimits, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Password recovery is temporarily unavailable. Please try again shortly.' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ message: 'Enter your email and the six-digit reset code.' });
    if (password.length < 12 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Use 12–128 characters with both a letter and a number.' });
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

router.post('/refresh', requireTrustedOrigin, async (req, res, next) => {
  try {
    const token = req.cookies?.[refreshCookie] || req.cookies?.[legacyRefreshCookie];
    if (!token) return res.status(401).json({ message: 'No active session' });
    // Consuming the old session atomically prevents replay of a stolen refresh token.
    const session = await RefreshSession.findOneAndDelete({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).populate('user');
    if (!session?.user?.active || session.user.accountStatus === 'blocked') {
      res.clearCookie(refreshCookie, cookieOptions);
      if (refreshCookie !== legacyRefreshCookie) res.clearCookie(legacyRefreshCookie, cookieOptions);
      return res.status(401).json({ message: 'Session expired' });
    }
    const user = session.user;
    res.json(await issueSession(user, req, res));
  } catch (error) { next(error); }
});

router.post('/logout', requireTrustedOrigin, async (req, res, next) => {
  try {
    const token = req.cookies?.[refreshCookie] || req.cookies?.[legacyRefreshCookie];
    if (token) await RefreshSession.deleteOne({ tokenHash: hashToken(token) });
    res.clearCookie(refreshCookie, cookieOptions);
    if (refreshCookie !== legacyRefreshCookie) res.clearCookie(legacyRefreshCookie, cookieOptions);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await RefreshSession.deleteMany({ user: req.user._id });
    res.clearCookie(refreshCookie, cookieOptions);
    if (refreshCookie !== legacyRefreshCookie) res.clearCookie(legacyRefreshCookie, cookieOptions);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: safeUser(req.user) }));

export default router;
