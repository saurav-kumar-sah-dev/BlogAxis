const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'follow','like_post','dislike_post','comment','reply',
      'new_report','warning','content_hidden','content_unhidden','content_deleted',
      'account_suspended','account_unsuspended','account_banned','account_deleted'
    ],
    required: true,
    index: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  details: { type: String, trim: true, maxlength: 500 },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

notificationSchema.index({ toUser: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);


