import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  passwordHash: { type: String, default: '', select: false },
  emailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ['provisional', 'active', 'blocked'], default: 'active', index: true },
  createdFrom: { type: String, enum: ['booking', 'registration', 'admin'], default: 'registration' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  adminRole: { type: String, enum: ['admin', 'super_admin'], default: undefined },
  adminSections: {
    type: [{
      type: String,
      enum: ['drivers', 'vehicles', 'bookings', 'inquiries', 'feedback', 'routes', 'pricing']
    }],
    default: undefined
  },
  active: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

// MongoDB enforces the business rule that only one owner-level administrator exists.
userSchema.index(
  { adminRole: 1 },
  { unique: true, partialFilterExpression: { adminRole: 'super_admin' } }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    adminRole: this.role === 'admin' ? (this.adminRole || 'admin') : undefined,
    active: this.active,
    emailVerified: this.emailVerified,
    accountStatus: this.accountStatus
  };
};

export default mongoose.model('User', userSchema);
