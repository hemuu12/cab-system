const FORBIDDEN_KEY = /^\$|\./;
const MAX_DEPTH = 12;

/**
 * Strips Mongo operator keys ($gt, $ne, $where) and dotted paths from untrusted input.
 * Route handlers still coerce their own values; this only removes the ability to smuggle
 * an operator object into a query filter, so a missed coercion cannot become an auth bypass.
 */
function scrub(value, depth = 0) {
  if (depth > MAX_DEPTH || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(item => scrub(item, depth + 1));

  const cleaned = {};
  for (const [key, item] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key)) continue;
    cleaned[key] = scrub(item, depth + 1);
  }
  return cleaned;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') req.body = scrub(req.body);
  if (req.params && typeof req.params === 'object') req.params = scrub(req.params);

  // Express 5 exposes `req.query` through a getter, so it is replaced rather than mutated.
  const query = req.query;
  if (query && typeof query === 'object') {
    const cleaned = scrub(query);
    Object.defineProperty(req, 'query', { value: cleaned, writable: true, configurable: true, enumerable: true });
  }
  next();
}

export { scrub };
