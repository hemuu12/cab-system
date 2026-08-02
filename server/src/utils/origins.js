const normalizeOrigin = value => {
  try { return new URL(String(value || '').trim()).origin; }
  catch { return ''; }
};

const defaultClientOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://cab-system-wk9q.vercel.app',
  'https://wondertravel.online',
  'https://www.wondertravel.online'
];

export const allowedOrigins = new Set(
  [...defaultClientOrigins, ...(process.env.CLIENT_URL || '').split(',')]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const vercelFrontendProject = process.env.VERCEL_FRONTEND_PROJECT || 'wondertravel';
const vercelFrontendTeam = process.env.VERCEL_FRONTEND_TEAM || 'hemuu12s-projects';

export function isTrustedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;
  try {
    const { protocol, hostname } = new URL(normalized);
    if (protocol !== 'https:') return false;
    if (hostname === `${vercelFrontendProject}.vercel.app`) return true;
    return hostname.startsWith(`${vercelFrontendProject}-`) && hostname.endsWith(`-${vercelFrontendTeam}.vercel.app`);
  } catch {
    return false;
  }
}

/** Cookie-authenticated mutations must originate from a known browser origin. */
export function requireTrustedOrigin(req, res, next) {
  if (process.env.NODE_ENV !== 'production') return next();
  const origin = req.get('origin');
  if (origin && isTrustedOrigin(origin)) return next();
  return res.status(403).json({ message: 'Request origin is not allowed' });
}
