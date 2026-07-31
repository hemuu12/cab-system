import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  licenseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
  experienceYears: { type: Number, min: 0, max: 70, default: 0 },
  status: { type: String, enum: ['onboarding', 'active', 'inactive', 'suspended'], default: 'onboarding', index: true },
  verified: { type: Boolean, default: false },
  notes: { type: String, trim: true, maxlength: 500 },
  onboardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
