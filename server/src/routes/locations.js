import { Router } from 'express';

const router = Router();
const PHOTON_URL = process.env.GEOCODER_URL || 'https://photon.komoot.io/api';
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const cache = new Map();

const clean = value => (typeof value === 'string' ? value.trim() : '');

/** Turns Photon's address parts into a readable, de-duplicated address. */
export function locationFromFeature(feature) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const street = [clean(properties.housenumber), clean(properties.street)].filter(Boolean).join(' ');
  const parts = [
    clean(properties.name),
    street,
    clean(properties.district) || clean(properties.locality),
    clean(properties.city),
    clean(properties.county),
    clean(properties.state),
    clean(properties.postcode),
    clean(properties.country)
  ].filter(Boolean);
  const uniqueParts = parts.filter((part, index) => (
    parts.findIndex(candidate => candidate.toLocaleLowerCase() === part.toLocaleLowerCase()) === index
  ));
  const lon = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (!uniqueParts.length || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    id: `${properties.osm_type || 'place'}-${properties.osm_id || `${lat}-${lon}`}`,
    label: uniqueParts.join(', '),
    // State drives the interstate permit charge, so it travels with every picked location.
    state: clean(properties.state),
    country: clean(properties.country),
    lat,
    lon
  };
}

router.get('/search', async (req, res, next) => {
  const query = clean(req.query.q).slice(0, 160);
  if (query.length < 3) return res.json([]);

  const cacheKey = query.toLocaleLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return res.json(cached.locations);

  try {
    const url = new URL(PHOTON_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '7');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('osm_tag', ':!bus_stop');
    url.searchParams.set('bbox', '68.1,6.5,97.4,35.7');

    const response = await fetch(url, {
      headers: { Accept: 'application/geo+json, application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw Object.assign(new Error('Location search is temporarily unavailable'), { status: 502 });

    const data = await response.json();
    const locations = (Array.isArray(data.features) ? data.features : [])
      .map(locationFromFeature)
      .filter(location => location && (!location.country || location.country === 'India'));

    if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, { createdAt: Date.now(), locations });
    res.json(locations);
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return next(Object.assign(new Error('Location search timed out. You can still enter the address manually.'), { status: 504 }));
    }
    next(error);
  }
});

export default router;
