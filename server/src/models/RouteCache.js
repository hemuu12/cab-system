import mongoose from 'mongoose';

/**
 * Road distance between two coordinate pairs. Distances between places do not
 * change, so entries never expire — they are only ever refined (haversine -> osrm -> manual).
 */
const routeCacheSchema = new mongoose.Schema({
  fromKey: { type: String, required: true },
  toKey: { type: String, required: true },
  fromLabel: { type: String, default: '' },
  toLabel: { type: String, default: '' },
  distanceKm: { type: Number, required: true, min: 1 },
  durationMin: { type: Number, default: 0 },
  source: { type: String, enum: ['osrm', 'haversine', 'manual', 'seed'], required: true },
  hits: { type: Number, default: 0 }
}, { timestamps: true });

routeCacheSchema.index({ fromKey: 1, toKey: 1 }, { unique: true });

export default mongoose.model('RouteCache', routeCacheSchema);
