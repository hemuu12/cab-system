import mongoose from 'mongoose';

/** A distance slab. `upToKm: null` means "everything beyond the previous slab". */
const slabSchema = new mongoose.Schema({
  upToKm: { type: Number, default: null },
  perKm: { type: Number, required: true, min: 1 }
}, { _id: false });

const tripRatesSchema = new mongoose.Schema({
  slabs: { type: [slabSchema], required: true },
  minKm: { type: Number, default: 0 },
  minKmPerDay: { type: Number, default: 0 },
  driverAllowancePerDay: { type: Number, required: true, min: 0 }
}, { _id: false });

/**
 * One rate card per seating class. Every vehicle points at one of these and
 * scales it with its own `rateMultiplier`, so adding a vehicle never adds a rate row.
 */
const pricingClassSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, enum: ['5-seater', '7-seater'] },
  label: { type: String, required: true },
  oneWay: { type: tripRatesSchema, required: true },
  roundTrip: { type: tripRatesSchema, required: true },
  nightChargeFromHour: { type: Number, default: 22 },
  nightChargeToHour: { type: Number, default: 6 },
  nightCharge: { type: Number, default: 0 },
  statePermitFlat: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 5 },
  kmPerDrivingDay: { type: Number, default: 500 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('PricingClass', pricingClassSchema);
