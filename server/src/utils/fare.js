const round = value => Math.round(value);

// Hill-station gateway towns where the road climbs — driver strain, fuel and brake wear run
// higher than plains driving. The surcharge is folded into the per-km rate for the hill
// portion of the trip only (see resolveHillKm in hillZones.js); it is never shown to the
// customer as a separate line.
export const HILL_SURCHARGE_PER_KM = 4;

/** Picks the slab whose ceiling covers the whole distance; the rate applies to every km. */
export function rateForDistance(slabs, distanceKm) {
  const ordered = [...slabs].sort((a, b) => (a.upToKm ?? Infinity) - (b.upToKm ?? Infinity));
  const match = ordered.find(slab => slab.upToKm == null || distanceKm <= slab.upToKm);
  return match?.perKm ?? ordered[ordered.length - 1]?.perKm ?? 0;
}

/** Calendar days between two dates, inclusive of both — a driver is paid per day blocked, not per 24 hours. */
export const MAX_TRIP_DAYS = 30;

export function daysBetween(startDate, endDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(endDate))) return 1;
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const days = Math.round((end - start) / 86400000) + 1;
  return Math.min(MAX_TRIP_DAYS, Math.max(1, days));
}

function isNightPickup(time, fromHour, toHour) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time ?? '').trim());
  if (!match) return false;
  const hour = Number(match[1]);
  if (hour > 23) return false;
  return fromHour > toHour ? hour >= fromHour || hour < toHour : hour >= fromHour && hour < toHour;
}

/**
 * Prices one vehicle for one trip. Pure: no database, no network, no clock.
 * `distanceKm` is the one-way road distance; round trips double it internally.
 */
export function calculateFare({
  distanceKm,
  tripType = 'one-way',
  days,
  time,
  fromState = '',
  toState = '',
  hillKm = 0
}, vehicle = {}, pricingClass) {
  if (!pricingClass) throw Object.assign(new Error('Pricing is not configured for this vehicle'), { status: 409 });

  const oneWayKm = Math.max(1, Math.round(Number(distanceKm) || 0));
  const multiplier = Number(vehicle.rateMultiplier) > 0 ? Number(vehicle.rateMultiplier) : 1;
  // Premium cars sit above their class by a flat rupee amount per km, applied after
  // the multiplier so the class slab taper still shows through on long trips.
  const perKmDelta = Number.isFinite(Number(vehicle.perKmDelta)) ? Number(vehicle.perKmDelta) : 0;
  // One-way hill km, clamped to the one-way distance. Round trips cover the same climb twice.
  const oneWayHillKm = Math.min(oneWayKm, Math.max(0, Math.round(Number(hillKm) || 0)));
  const isRoundTrip = tripType === 'round-trip';
  const rates = isRoundTrip ? pricingClass.roundTrip : pricingClass.oneWay;

  // One-way days come from how far a driver can realistically drive; round-trip days come from the customer's dates.
  const drivingDays = Math.max(1, Math.ceil(oneWayKm / (pricingClass.kmPerDrivingDay || 500)));
  const chargeableDays = isRoundTrip ? Math.max(1, Math.round(Number(days) || 1)) : drivingDays;

  const actualKm = isRoundTrip ? oneWayKm * 2 : oneWayKm;
  const actualHillKm = isRoundTrip ? oneWayHillKm * 2 : oneWayHillKm;
  const floorKm = isRoundTrip ? (rates.minKmPerDay || 0) * chargeableDays : (rates.minKm || 0);
  const billableKm = Math.max(actualKm, floorKm);
  // The minimum-km floor pads the plain portion (empty-return / per-day minimum), never the
  // hill portion — hill km is billed at what the road actually measures, no more.
  const billableHillKm = Math.min(billableKm, actualHillKm);
  const billablePlainKm = billableKm - billableHillKm;

  const classPerKm = rateForDistance(rates.slabs, billableKm);
  const perKm = Math.max(1, round(classPerKm * multiplier + perKmDelta));
  // Silent hill surcharge: folded into the hill portion's rate only, never itemized for the customer.
  const hillPerKm = billableHillKm > 0 ? perKm + HILL_SURCHARGE_PER_KM : 0;
  const kmCharge = (perKm * billablePlainKm) + (hillPerKm * billableHillKm);
  const driverAllowance = (rates.driverAllowancePerDay || 0) * chargeableDays;

  const nightApplies = isNightPickup(time, pricingClass.nightChargeFromHour ?? 22, pricingClass.nightChargeToHour ?? 6);
  const nightCharge = nightApplies ? (pricingClass.nightCharge || 0) : 0;

  const crossesState = Boolean(fromState && toState) && fromState !== toState;
  const statePermit = crossesState ? (pricingClass.statePermitFlat || 0) : 0;

  const subtotal = kmCharge + driverAllowance + nightCharge + statePermit;
  const gst = round(subtotal * ((pricingClass.gstPercent ?? 5) / 100));
  const total = subtotal + gst;

  const notes = ['Tolls and parking are charged at actual and paid directly by the passenger.'];
  if (crossesState) notes.push('Interstate permit and state tax are estimated; any difference is settled at actual.');
  if (billableKm > actualKm) {
    notes.push(isRoundTrip
      ? `A minimum of ${rates.minKmPerDay} km per day applies, so ${billableKm} km is billed.`
      : `A minimum of ${rates.minKm} km applies to one-way trips, which covers the driver's empty return.`);
  }

  return {
    tripType,
    distanceKm: oneWayKm,
    actualKm,
    billableKm,
    days: chargeableDays,
    perKm,
    classPerKm,
    rateMultiplier: multiplier,
    perKmDelta,
    pricingClassKey: pricingClass.key,
    kmCharge,
    driverAllowance,
    nightCharge,
    statePermit,
    subtotal,
    gstPercent: pricingClass.gstPercent ?? 5,
    gst,
    total,
    notes
  };
}
