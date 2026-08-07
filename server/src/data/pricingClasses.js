/**
 * Seed rate cards. Two classes only — every vehicle maps onto one of them.
 * Rates are indicative Delhi-market numbers; the owner edits them from admin.
 *
 * minKm/minKmPerDay are 0: the fare always reflects the actual route distance, no
 * minimum-distance floor. A short local trip is billed for what it actually covers.
 */
export const PRICING_CLASSES = [
  {
    key: '5-seater',
    label: 'Sedan (4+1)',
    oneWay: {
      slabs: [
        { upToKm: 300, perKm: 13 },
        { upToKm: 800, perKm: 12 },
        { upToKm: null, perKm: 11 }
      ],
      minKm: 0,
      driverAllowancePerDay: 300
    },
    roundTrip: {
      slabs: [
        { upToKm: 600, perKm: 12 },
        { upToKm: 1600, perKm: 11 },
        { upToKm: null, perKm: 10 }
      ],
      minKmPerDay: 0,
      driverAllowancePerDay: 300
    },
    nightChargeFromHour: 22,
    nightChargeToHour: 6,
    nightCharge: 300,
    statePermitFlat: 1200,
    gstPercent: 5,
    kmPerDrivingDay: 500,
    active: true
  },
  {
    key: '7-seater',
    label: 'SUV / MPV (6+1)',
    oneWay: {
      slabs: [
        { upToKm: 300, perKm: 18 },
        { upToKm: 800, perKm: 16 },
        { upToKm: null, perKm: 14 }
      ],
      minKm: 0,
      driverAllowancePerDay: 400
    },
    roundTrip: {
      slabs: [
        { upToKm: 600, perKm: 17 },
        { upToKm: 1600, perKm: 15 },
        { upToKm: null, perKm: 13 }
      ],
      minKmPerDay: 0,
      driverAllowancePerDay: 400
    },
    nightChargeFromHour: 22,
    nightChargeToHour: 6,
    nightCharge: 400,
    statePermitFlat: 1500,
    gstPercent: 5,
    kmPerDrivingDay: 500,
    active: true
  }
];

/** Fallback used when Mongo is unavailable. */
export const pricingClassByKey = key => PRICING_CLASSES.find(item => item.key === key);
