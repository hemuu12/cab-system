import mongoose from 'mongoose';

const securityRateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { versionKey: false });

export default mongoose.model('SecurityRateLimit', securityRateLimitSchema);
