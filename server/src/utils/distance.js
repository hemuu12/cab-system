import mongoose from 'mongoose';
import RouteCache from '../models/RouteCache.js';

const OSRM_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';
const ROAD_FACTOR = 1.25;

/** Coordinates rounded to ~110 m so nearby pickup points share one cache entry. */
export const coordKey = ({ lat, lon }) => `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;

export function haversineKm(from, to) {
  const toRad = degrees => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRad(to.lat - from.lat);
  const deltaLon = toRad(to.lon - from.lon);
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchOsrm(from, to) {
  const path = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const response = await fetch(`${OSRM_URL}/route/v1/driving/${path}?overview=false`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) throw new Error(`OSRM responded ${response.status}`);

  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route?.distance) throw new Error('OSRM returned no route');
  return {
    distanceKm: Math.max(1, Math.round(route.distance / 1000)),
    durationMin: Math.round((route.duration || 0) / 60)
  };
}

/**
 * One-way road distance between two geocoded points.
 * Cache -> OSRM -> haversine estimate, so a quote is never blocked by a slow router.
 */
export async function resolveDistance(from, to) {
  const fromKey = coordKey(from);
  const toKey = coordKey(to);
  const connected = mongoose.connection.readyState === 1;

  if (connected) {
    const cached = await RouteCache.findOneAndUpdate(
      { fromKey, toKey },
      { $inc: { hits: 1 } },
      { new: true }
    ).lean();
    if (cached) {
      return { distanceKm: cached.distanceKm, durationMin: cached.durationMin, source: cached.source };
    }
  }

  let resolved;
  try {
    resolved = { ...(await fetchOsrm(from, to)), source: 'osrm' };
  } catch {
    resolved = {
      distanceKm: Math.max(1, Math.round(haversineKm(from, to) * ROAD_FACTOR)),
      durationMin: 0,
      source: 'haversine'
    };
  }

  // Only persist real routing results; a haversine guess should be retried on the next quote.
  if (connected && resolved.source === 'osrm') {
    await RouteCache.updateOne(
      { fromKey, toKey },
      {
        $setOnInsert: {
          fromKey,
          toKey,
          fromLabel: from.label || '',
          toLabel: to.label || '',
          ...resolved
        }
      },
      { upsert: true }
    ).catch(() => {});
  }

  return resolved;
}
