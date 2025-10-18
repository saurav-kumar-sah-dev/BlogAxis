const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Who reported
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // What was reported
  reportedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  
  // Report details
  reason: { 
    type: String, 
    enum: [
      'spam', 
      'harassment', 
      'hate_speech', 
      'inappropriate_content', 
      'fake_news', 
      'copyright_violation', 
      'violence', 
      'nudity', 
      'other'
    ], 
    required: true 
  },
  description: { type: String, trim: true, maxlength: 1000 },
  
  // Moderation status
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'], 
    default: 'pending', 
    index: true 
  },
  
  // Admin actions
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderationNotes: { type: String, trim: true, maxlength: 1000 },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'hide_content', 'delete_content', 'suspend_user', 'ban_user']
  },
  
  // Audit trail
  reviewedAt: { type: Date },
  resolvedAt: { type: Date },
  
}, { timestamps: true });

// Indexes for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedPost: 1, status: 1 });
reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
