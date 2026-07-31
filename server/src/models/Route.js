import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  destination: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  region: { type: String, required: true, trim: true, maxlength: 80, index: true },
  distanceKm: { type: Number, required: true, min: 1 },
  popular: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
