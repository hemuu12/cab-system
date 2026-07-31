import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';

/** Values that must never be written into an audit entry, even as a "changed" marker. */
const REDACTED = new Set(['password', 'passwordHash', 'accessTokenHash', 'token', 'otp']);
const REDACTED_VALUE = '[redacted]';

const normalize = value => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.parse(JSON.stringify(value));
  return value;
};

const sameValue = (before, after) => JSON.stringify(normalize(before)) === JSON.stringify(normalize(after));

/** Reduces an update to only the fields whose value actually changed. */
export function diffFields(before = {}, after = {}) {
  const changes = {};
  for (const field of Object.keys(after)) {
    if (REDACTED.has(field)) {
      changes[field] = { from: REDACTED_VALUE, to: REDACTED_VALUE };
      continue;
    }
    if (!sameValue(before?.[field], after[field])) {
      changes[field] = { from: normalize(before?.[field]), to: normalize(after[field]) };
    }
  }
  return changes;
}

/**
 * Writes an audit entry. Never throws: an audit outage must not block the operation it
 * describes, but the failure is surfaced in the logs so it can be noticed.
 */
export async function recordAudit(req, { action, targetType = '', targetId = '', targetLabel = '', changes = {} }) {
  try {
    if (mongoose.connection.readyState !== 1) return;
    if (changes && Object.keys(changes).length === 0) return;
    await AuditLog.create({
      action,
      actor: req.user?._id,
      actorEmail: req.user?.email || '',
      actorRole: req.user?.adminRole || req.user?.role || '',
      targetType,
      targetId: String(targetId || ''),
      targetLabel: String(targetLabel || '').slice(0, 200),
      changes,
      ip: String(req.ip || '').slice(0, 80),
      userAgent: String(req.get?.('user-agent') || '').slice(0, 300)
    });
  } catch (error) {
    console.error('Audit write failed:', error.message);
  }
}
