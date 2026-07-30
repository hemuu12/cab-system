import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  city: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  experienceYears: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['onboarding', 'active', 'inactive', 'suspended'], default: 'onboarding', index: true },
  verified: { type: Boolean, default: false },
  notes: { type: String, trim: true },
  onboardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
