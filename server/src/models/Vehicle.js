import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, maxlength: 40 },
  description: { type: String, maxlength: 500, default: '' },
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
  features: [{ type: String, maxlength: 60 }],
  images: [{
    url: { type: String, required: true, maxlength: 500 },
    publicId: { type: String, required: true, maxlength: 200 },
    width: Number,
    height: Number,
    format: { type: String, maxlength: 20 },
    alt: { type: String, maxlength: 160 }
  }],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
