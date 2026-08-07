import { resolveDistance } from './distance.js';

/**
 * Hill destinations and the plains "gateway" town where the climb starts for each — the last
 * flat town before the road starts switchbacking. Distance from gateway to destination is
 * billed as hill km (surcharge applies); everything before the gateway is plain km (base rate).
 * Coordinates are the town centre, good enough for a gateway-distance estimate.
 */
const GATEWAYS = {
  haldwani: { lat: 29.2183, lon: 79.5130, label: 'Haldwani' },
  dehradun: { lat: 30.3165, lon: 78.0322, label: 'Dehradun' },
  rishikesh: { lat: 30.0869, lon: 78.2676, label: 'Rishikesh' },
  kotdwar: { lat: 29.7451, lon: 78.5286, label: 'Kotdwar' }
};

// Destination match (checked against the drop label, case-insensitive) -> its gateway town.
const HILL_DESTINATIONS = [
  ['nainital', GATEWAYS.haldwani],
  ['bhimtal', GATEWAYS.haldwani],
  ['mukteshwar', GATEWAYS.haldwani],
  ['ranikhet', GATEWAYS.haldwani],
  ['almora', GATEWAYS.haldwani],
  ['kausani', GATEWAYS.haldwani],
  ['jim corbett', GATEWAYS.haldwani],
  ['ramnagar', GATEWAYS.haldwani],
  ['mussoorie', GATEWAYS.dehradun],
  ['auli', GATEWAYS.rishikesh],
  ['joshimath', GATEWAYS.rishikesh],
  ['badrinath', GATEWAYS.rishikesh],
  ['kedarnath', GATEWAYS.rishikesh],
  ['gaurikund', GATEWAYS.rishikesh],
  ['gangotri', GATEWAYS.rishikesh],
  ['yamunotri', GATEWAYS.rishikesh],
  ['janki chatti', GATEWAYS.rishikesh],
  ['lansdowne', GATEWAYS.kotdwar],
  ['chopta', GATEWAYS.rishikesh]
];

function gatewayFor(label) {
  const value = String(label || '').toLowerCase();
  const match = HILL_DESTINATIONS.find(([needle]) => value.includes(needle));
  return match?.[1] || null;
}

/**
 * How many of the trip's km are hill km, for a given drop point.
 * Falls back to 0 (no surcharge) if the destination isn't a known hill town, or if the
 * gateway lookup fails — a quote should never break because a surcharge lookup timed out.
 */
export async function resolveHillKm(dropPoint, oneWayKm) {
  const gateway = gatewayFor(dropPoint?.label);
  if (!gateway) return 0;
  try {
    const { distanceKm } = await resolveDistance(gateway, dropPoint);
    // Hill km can't exceed the whole trip (a short trip that starts inside the hills already).
    return Math.min(oneWayKm, Math.max(0, Math.round(distanceKm)));
  } catch {
    return 0;
  }
}
