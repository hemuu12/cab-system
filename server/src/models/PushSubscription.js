import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  endpoint: { type: String, required: true, maxlength: 2048 },
  endpointHash: { type: String, required: true, unique: true, index: true },
  keys: {
    p256dh: { type: String, required: true, maxlength: 512 },
    auth: { type: String, required: true, maxlength: 256 }
  },
  expirationTime: Date,
  userAgent: { type: String, maxlength: 500, default: '' },
  locale: { type: String, maxlength: 35, default: '' },
  timezone: { type: String, maxlength: 100, default: '' },
  active: { type: Boolean, default: true, index: true },
  lastSuccessAt: Date,
  lastFailureAt: Date,
  failureCount: { type: Number, default: 0 }
}, { timestamps: true });

pushSubscriptionSchema.index({ user: 1, active: 1 });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
