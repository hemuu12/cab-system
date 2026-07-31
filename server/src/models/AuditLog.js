import mongoose from 'mongoose';

/**
 * Append-only record of privileged changes. Entries are never updated or deleted by the
 * application, so a rate change or account action can always be traced to an operator.
 */
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true, maxlength: 60 },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  actorEmail: { type: String, default: '', maxlength: 254 },
  actorRole: { type: String, default: '', maxlength: 40 },
  targetType: { type: String, default: '', maxlength: 40 },
  targetId: { type: String, default: '', maxlength: 80 },
  targetLabel: { type: String, default: '', maxlength: 200 },
  // Only the fields that actually changed, as { field: { from, to } }.
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '', maxlength: 80 },
  userAgent: { type: String, default: '', maxlength: 300 }
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
