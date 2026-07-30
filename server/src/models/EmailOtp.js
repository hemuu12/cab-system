import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  purpose: { type: String, enum: ['login', 'password-reset'], default: 'login', index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  consumedAt: Date,
  requestedIp: { type: String, maxlength: 80, default: '' }
}, { timestamps: true });

emailOtpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export default mongoose.model('EmailOtp', emailOtpSchema);
