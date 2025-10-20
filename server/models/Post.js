// models/Post.js
const mongoose = require('mongoose'); 

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },

    // Type of post: text, image, video, document, article
    type: { type: String, enum: ['text', 'image', 'video', 'document', 'article'], default: 'text', index: true },

    // Image (legacy fields kept for backward compatibility)
    imageUrl: { type: mongoose.Schema.Types.Mixed }, // Can be String or Array
    imagePublicId: { type: mongoose.Schema.Types.Mixed }, // Can be String or Array

    // General media
    mediaUrl: { type: mongoose.Schema.Types.Mixed }, // Can be String or Array
    mediaPublicId: { type: mongoose.Schema.Types.Mixed }, // Can be String or Array
    mediaMimeType: { type: mongoose.Schema.Types.Mixed }, // Can be String or Array


    // Document specific
    docUrl: { type: String },
    docPublicId: { type: String },
    docMimeType: { type: String },
    docOriginalName: { type: String },
    docSize: { type: Number }, // file size in bytes

    // Video specific
    videoUrl: { type: String },
    videoPublicId: { type: String },
    videoDurationSec: { type: Number, min: 0, max: 150 }, // up to 2m30s (150s)

    // Article specific
    articleContent: { type: String, trim: true, maxlength: 20000 },
  
  // Reactions
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Organization
  tags: [{ type: String, trim: true, lowercase: true }],
  categories: [{ type: String, trim: true }],

  // Publishing lifecycle
  status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'published', index: true },
  scheduledAt: { type: Date },
  publishedAt: { type: Date },

  // Analytics
  views: { type: Number, default: 0, min: 0 },
  hidden: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

postSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Post', postSchema);