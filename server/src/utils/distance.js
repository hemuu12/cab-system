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

const MAX_DISTANCE_KM = 6000;

/** Rejects anything that is not a real coordinate before it can reach an outbound URL. */
const isCoordinate = point => (
  Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)) &&
  Math.abs(Number(point.lat)) <= 90 && Math.abs(Number(point.lon)) <= 180
);

async function fetchOsrm(from, to) {
  // Fixed decimal places: the coordinates are numbers by this point, and formatting them
  // ourselves guarantees nothing but digits reaches the path segment.
  const point = value => Number(value).toFixed(6);
  const path = `${point(from.lon)},${point(from.lat)};${point(to.lon)},${point(to.lat)}`;
  const response = await fetch(`${OSRM_URL}/route/v1/driving/${path}?overview=false`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) throw new Error(`OSRM responded ${response.status}`);

  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route?.distance) throw new Error('OSRM returned no route');
  const distanceKm = Math.round(route.distance / 1000);
  if (!Number.isFinite(distanceKm) || distanceKm < 1 || distanceKm > MAX_DISTANCE_KM) {
    throw new Error('OSRM returned an implausible distance');
  }
  return { distanceKm, durationMin: Math.max(0, Math.round((route.duration || 0) / 60)) };
}

/**
 * One-way road distance between two geocoded points.
 * Cache -> OSRM -> haversine estimate, so a quote is never blocked by a slow router.
 */
export async function resolveDistance(from, to) {
  if (!isCoordinate(from) || !isCoordinate(to)) {
    throw Object.assign(new Error('Choose both locations from the address suggestions'), { status: 400 });
  }
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
  } catch (error) {
    if (error.status === 400) throw error;
    const estimated = Math.round(haversineKm(from, to) * ROAD_FACTOR);
    resolved = {
      distanceKm: Math.min(MAX_DISTANCE_KM, Math.max(1, estimated)),
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
