import mongoose from 'mongoose';

const refreshSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  userAgent: { type: String, maxlength: 300, default: '' },
  ip: { type: String, maxlength: 80, default: '' },
  lastUsedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('RefreshSession', refreshSessionSchema);
