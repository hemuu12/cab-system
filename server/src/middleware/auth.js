import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const accessSecret = () => process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me';

export async function authenticate(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Please sign in to continue' });
    const payload = jwt.verify(token, accessSecret(), { algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user?.active || user.accountStatus === 'blocked') return res.status(401).json({ message: 'This account is unavailable' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: 'You do not have permission to perform this action' });
}
