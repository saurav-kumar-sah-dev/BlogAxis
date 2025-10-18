const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Post = require('./Post');
const { destroy } = require('../utils/cloudinary');

const userSchema = new mongoose.Schema({
  // Basic info
  firstName: { type: String, trim: true, maxlength: 50 },
  lastName: { type: String, trim: true, maxlength: 50 },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, minlength: 2, maxlength: 30 },
  
  // Profile info
  bio: { type: String, trim: true, maxlength: 200 },
  place: { type: String, trim: true, maxlength: 100 },
  info: { type: String, trim: true, maxlength: 500 },
  dateOfBirth: { type: Date },
  
  // Avatar
  avatarUrl: { type: String },
  avatarPublicId: { type: String },
  
  // OAuth
  googleId: { type: String, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  
  // Social graph
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Roles
  role: { type: String, enum: ['user','admin'], default: 'user', index: true },
  suspended: { type: Boolean, default: false, index: true },
  
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Cascade delete the user's posts + images
async function cascadeDeletePosts(userId) {
  const posts = await Post.find({ user: userId }).select('_id imagePublicId');
  // Best-effort: delete images, ignore failures
  await Promise.all(posts.map(async p => {
    if (p.imagePublicId) {
      try { await destroy(p.imagePublicId); } catch (e) {}
    }
  }));
  await Post.deleteMany({ user: userId });
}

// Runs for findByIdAndDelete / findOneAndDelete
userSchema.post('findOneAndDelete', async function(doc) {
  if (doc) await cascadeDeletePosts(doc._id);
});

// Runs for doc.deleteOne()
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await cascadeDeletePosts(this._id);
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('User', userSchema);