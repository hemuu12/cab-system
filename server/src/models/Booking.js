import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  pickup: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  distanceKm: { type: Number, min: 1 },
  travelDays: { type: Number, min: 1, max: 30, default: 1 },
  tripType: { type: String, enum: ['one-way', 'round-trip', 'city-use', 'outstation'], default: 'one-way' },
  serviceMode: { type: String, enum: ['chauffeur', 'group-travel'], default: 'chauffeur' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  passenger: {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, maxlength: 500 }
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], default: 'upi' },
  fare: {
    base: Number,
    driverAllowance: Number,
    toll: Number,
    gst: Number,
    total: Number
  },
  status: { type: String, enum: ['confirmed', 'active', 'completed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
