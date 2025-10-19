const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied', 'closed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  repliedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
contactSubmissionSchema.index({ email: 1, submittedAt: -1 });
contactSubmissionSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
