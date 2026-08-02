import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');

const { origins, destinations } = JSON.parse(readFileSync(path.join(__dirname, 'city-coords.json'), 'utf8'));

const featuredSrc = readFileSync(path.join(REPO, 'server/src/data/featuredRoutes.js'), 'utf8');
const FEATURED_ROUTES = eval(featuredSrc.replace('export const FEATURED_ROUTES', 'const FEATURED_ROUTES') + '\nFEATURED_ROUTES');

const cityOf = destination => String(destination).split(',')[0].trim();

// Same constants/logic as server/src/utils/distance.js, replicated here since this
// script runs standalone against the public OSRM router rather than through the API.
const ROAD_FACTOR = 1.25;
const MAX_DISTANCE_KM = 6000;
const OSRM_URL = 'https://router.project-osrm.org';

function haversineKm(from, to) {
  const toRad = degrees => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRad(to.lat - from.lat);
  const deltaLon = toRad(to.lon - from.lon);
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchOsrm(from, to) {
  const point = value => Number(value).toFixed(6);
  const routePath = `${point(from.lon)},${point(from.lat)};${point(to.lon)},${point(to.lat)}`;
  const response = await fetch(`${OSRM_URL}/route/v1/driving/${routePath}?overview=false`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`OSRM responded ${response.status}`);
  const data = await response.json();
  const route = data?.routes?.[0];
  if (!route?.distance) throw new Error('OSRM returned no route');
  const distanceKm = Math.round(route.distance / 1000);
  if (!Number.isFinite(distanceKm) || distanceKm < 1 || distanceKm > MAX_DISTANCE_KM) {
    throw new Error('OSRM returned an implausible distance');
  }
  return distanceKm;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Sequential with a fixed delay — this hits the free shared OSRM demo server, not a private instance. */
async function main() {
  const results = [];
  const originNames = Object.keys(origins);

  for (const originName of originNames) {
    const originCoord = origins[originName];

    for (const route of FEATURED_ROUTES) {
      const city = cityOf(route.destination);
      if (city === originName) continue;

      const destCoord = destinations[city];
      if (!destCoord) {
        console.error(`Missing coords for destination "${city}", skipping`);
        continue;
      }

      let distanceKm;
      let source;
      try {
        distanceKm = await fetchOsrm(originCoord, destCoord);
        source = 'osrm';
      } catch (error) {
        distanceKm = Math.round(haversineKm(originCoord, destCoord) * ROAD_FACTOR);
        source = 'haversine';
        console.error(`OSRM failed for ${originName} -> ${city}: ${error.message}, using haversine estimate ${distanceKm}km`);
      }

      results.push({ origin: originName, destination: route.destination, region: route.region, distanceKm, source });
      console.log(`${originName} -> ${city}: ${distanceKm}km (${source})`);

      await sleep(350);
    }
  }

  writeFileSync(path.join(__dirname, 'route-matrix.json'), JSON.stringify(results, null, 2));
  const osrmCount = results.filter(r => r.source === 'osrm').length;
  const haversineCount = results.filter(r => r.source === 'haversine').length;
  console.log(`\nDone. ${results.length} pairs total, ${osrmCount} via OSRM, ${haversineCount} via haversine fallback.`);
}

main();
