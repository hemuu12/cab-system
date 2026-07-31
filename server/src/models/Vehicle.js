import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: String,
  seats: { type: Number, required: true },
  luggage: { type: Number, default: 2 },
  pricingClass: { type: String, enum: ['5-seater', '7-seater'], default: '5-seater', index: true },
  rateMultiplier: { type: Number, default: 1, min: 0.1 },
  // Flat rupees per km on top of the class rate: positive for premium cars, negative for budget ones.
  perKmDelta: { type: Number, default: 0 },
  baseFare: { type: Number, default: 0 },
  driverAllowance: { type: Number, default: 0 },
  toll: { type: Number, default: 150 },
  gst: Number,
  totalFare: Number,
  pricingConfigured: { type: Boolean, default: true, index: true },
  features: [String],
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    format: String,
    alt: String
  }],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
