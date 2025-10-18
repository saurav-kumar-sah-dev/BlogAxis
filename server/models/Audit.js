const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  // Who performed the action
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Action details
  action: { 
    type: String, 
    enum: [
      'report_reviewed',
      'post_hidden',
      'post_unhidden',
      'post_deleted',
      'user_warned',
      'user_suspended',
      'user_unsuspended',
      'user_banned',
      'user_deleted',
      'comment_deleted',
      'content_approved',
      'report_dismissed'
    ], 
    required: true 
  },
  
  // Target of the action
  targetType: { 
    type: String, 
    enum: ['post', 'user', 'comment', 'report'], 
    required: true 
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // Action details
  reason: { type: String, trim: true, maxlength: 500 },
  details: { type: String, trim: true, maxlength: 1000 },
  
  // Related report (if applicable)
  relatedReport: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  
  // IP and user agent for security
  ipAddress: { type: String },
  userAgent: { type: String },
  
}, { timestamps: true });

// Indexes for efficient queries
auditSchema.index({ admin: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ targetType: 1, targetId: 1 });
auditSchema.index({ relatedReport: 1 });

module.exports = mongoose.model('Audit', auditSchema);
