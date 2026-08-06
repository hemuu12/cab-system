import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { accessSecret, TOKEN_AUDIENCE, TOKEN_ISSUER } from '../utils/security.js';

export const ADMIN_PERMISSIONS = Object.freeze({
  READ: 'admin:read',
  CREATE: 'admin:create',
  UPDATE: 'admin:update',
  DELETE: 'admin:delete',
  MANAGE_ADMINS: 'admin:manage'
});

export const ADMIN_MANAGEABLE_SECTIONS = Object.freeze([
  'drivers',
  'vehicles',
  'bookings',
  'inquiries',
  'feedback',
  'routes',
  'pricing'
]);

const ACCESS_PERMISSIONS = Object.freeze({
  admin: [ADMIN_PERMISSIONS.READ, ADMIN_PERMISSIONS.CREATE, ADMIN_PERMISSIONS.UPDATE],
  super_admin: Object.values(ADMIN_PERMISSIONS)
});

export function adminPermissionsFor(user) {
  if (user?.role !== 'admin') return [];
  return ACCESS_PERMISSIONS[user.adminRole || 'admin'] || [];
}

export function adminSectionsFor(user) {
  if (user?.role !== 'admin') return [];
  // 'users' and 'audit' are never delegated: they are reserved for the super administrator.
  if (user.adminRole === 'super_admin') return ['dashboard', ...ADMIN_MANAGEABLE_SECTIONS, 'users', 'audit'];
  const assigned = Array.isArray(user.adminSections)
    ? user.adminSections
    : ADMIN_MANAGEABLE_SECTIONS;
  return ['dashboard', ...assigned.filter(section => ADMIN_MANAGEABLE_SECTIONS.includes(section))];
}

export async function authenticate(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Please sign in to continue' });
    const payload = jwt.verify(token, accessSecret(), {
      algorithms: ['HS256'],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    });
    const user = await User.findById(payload.sub);
    if (!user?.active || user.accountStatus === 'blocked') return res.status(401).json({ message: 'This account is unavailable' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

/**
 * Attaches req.user when a valid Bearer token is present, but never blocks the
 * request — an expired or missing token should fall back to guest access (e.g.
 * a booking-status page that also accepts a booking access token), not a hard 401.
 */
export async function optionalAuthenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next();
  try {
    const payload = jwt.verify(token, accessSecret(), {
      algorithms: ['HS256'],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    });
    const user = await User.findById(payload.sub);
    if (user?.active && user.accountStatus !== 'blocked') req.user = user;
  } catch {
    // Invalid/expired token on an optional route: continue as guest.
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: 'You do not have permission to perform this action' });
}

export function requireAdminPermission(permission) {
  return (req, res, next) => adminPermissionsFor(req.user).includes(permission)
    ? next()
    : res.status(403).json({ message: 'Only the super administrator can perform this action' });
}

export function requireAdminSection(section) {
  return (req, res, next) => adminSectionsFor(req.user).includes(section)
    ? next()
    : res.status(403).json({ message: 'You do not have access to this admin section' });
}
