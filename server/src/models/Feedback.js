import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
  city: { type: String, trim: true, maxlength: 80, default: '' },
  tripLabel: { type: String, trim: true, maxlength: 120, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, trim: true, maxlength: 800, default: '' },
  photo: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    width: Number,
    height: Number,
    format: String,
    alt: { type: String, maxlength: 160, default: '' }
  },
  consentToPublish: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  featured: { type: Boolean, default: false, index: true },
  approvedAt: Date,
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date
}, { timestamps: true });

feedbackSchema.index({ status: 1, featured: -1, approvedAt: -1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
