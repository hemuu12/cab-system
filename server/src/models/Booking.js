import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  accessTokenHash: { type: String, select: false, index: true },
  pickup: { type: String, required: true, trim: true, maxlength: 200 },
  destination: { type: String, required: true, trim: true, maxlength: 200 },
  date: { type: String, required: true, maxlength: 10 },
  time: { type: String, required: true, maxlength: 5 },
  distanceKm: { type: Number, min: 1 },
  travelDays: { type: Number, min: 1, max: 30, default: 1 },
  tripType: { type: String, enum: ['one-way', 'round-trip', 'outstation'], default: 'one-way' },
  serviceMode: { type: String, enum: ['chauffeur', 'group-travel'], default: 'chauffeur' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  passenger: {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, lowercase: true, trim: true, maxlength: 120, default: '' },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    notes: { type: String, maxlength: 500 }
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], default: 'cash' },
  // Snapshot of the quote at booking time, including the rates used, so later rate
  // changes never rewrite an existing booking's price.
  fare: {
    tripType: String,
    distanceKm: Number,
    actualKm: Number,
    billableKm: Number,
    days: Number,
    perKm: Number,
    classPerKm: Number,
    rateMultiplier: Number,
    perKmDelta: Number,
    pricingClassKey: String,
    kmCharge: Number,
    driverAllowance: Number,
    nightCharge: Number,
    statePermit: Number,
    subtotal: Number,
    gstPercent: Number,
    gst: Number,
    total: Number,
    notes: [String]
  },
  status: { type: String, enum: ['confirmed', 'active', 'completed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
