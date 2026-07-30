import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  type: { type: String, enum: ['fleet-partner', 'chauffeur', 'support'], required: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  message: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
