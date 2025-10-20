const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Post = require('./Post');
const Comment = require('./Comment');
const Notification = require('./Notification');
const Report = require('./Report');
const Audit = require('./Audit');
const { destroy } = require('../utils/cloudinary');
const { validateAge } = require('../utils/ageValidation');

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
  dateOfBirth: { type: Date, required: function() { return !this.isGoogleUser; } },
  
  // Avatar
  avatarUrl: { type: String },
  avatarPublicId: { type: String },
  
  // OAuth
  googleId: { type: String, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  
  // Terms and conditions
  acceptTerms: { type: Boolean, default: false },
  
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

// Age validation middleware
userSchema.pre('save', function(next) {
  if (this.isModified('dateOfBirth') && this.dateOfBirth && !this.isGoogleUser) {
    const ageValidation = validateAge(this.dateOfBirth, 13);
    if (!ageValidation.isValid) {
      return next(new Error(ageValidation.error));
    }
  }
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Comprehensive cascade delete for all user-related data
async function cascadeDeleteUserData(userId) {
  try {
    console.log(`Starting cascade deletion for user: ${userId}`);
    
    // 1. Delete user's posts and associated media
    const posts = await Post.find({ user: userId }).select('_id imagePublicId videoPublicId docPublicId mediaPublicId');
    console.log(`Found ${posts.length} posts to delete`);
    
    // Delete all media files from Cloudinary
    await Promise.all(posts.map(async post => {
      const mediaIds = [];
      
      // Collect all media public IDs
      if (post.imagePublicId) {
        if (Array.isArray(post.imagePublicId)) {
          mediaIds.push(...post.imagePublicId);
        } else {
          mediaIds.push(post.imagePublicId);
        }
      }
      if (post.videoPublicId) mediaIds.push(post.videoPublicId);
      if (post.docPublicId) mediaIds.push(post.docPublicId);
      if (post.mediaPublicId) {
        if (Array.isArray(post.mediaPublicId)) {
          mediaIds.push(...post.mediaPublicId);
        } else {
          mediaIds.push(post.mediaPublicId);
        }
      }
      
      // Delete all media files
      await Promise.all(mediaIds.map(async id => {
        try { 
          await destroy(id); 
          console.log(`Deleted media: ${id}`);
        } catch (e) {
          console.warn(`Failed to delete media ${id}:`, e.message);
        }
      }));
    }));
    
    // Delete all posts
    await Post.deleteMany({ user: userId });
    console.log(`Deleted ${posts.length} posts`);
    
    // 2. Delete user's comments
    const commentsDeleted = await Comment.deleteMany({ user: userId });
    console.log(`Deleted ${commentsDeleted.deletedCount} comments`);
    
    // 3. Remove user from all likes/dislikes in posts
    const postsUpdated = await Post.updateMany(
      { $or: [{ likes: userId }, { dislikes: userId }] },
      { 
        $pull: { 
          likes: userId, 
          dislikes: userId 
        } 
      }
    );
    console.log(`Updated ${postsUpdated.modifiedCount} posts to remove likes/dislikes`);
    
    // 4. Remove user from all likes/dislikes in comments
    const commentsUpdated = await Comment.updateMany(
      { $or: [{ likes: userId }, { dislikes: userId }] },
      { 
        $pull: { 
          likes: userId, 
          dislikes: userId 
        } 
      }
    );
    console.log(`Updated ${commentsUpdated.modifiedCount} comments to remove likes/dislikes`);
    
    // 5. Remove user from followers/following lists of other users
    const followersUpdated = await mongoose.model('User').updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    console.log(`Removed user from ${followersUpdated.modifiedCount} users' followers list`);
    
    const followingUpdated = await mongoose.model('User').updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    console.log(`Removed user from ${followingUpdated.modifiedCount} users' following list`);
    
    // 6. Delete all notifications involving this user
    const notificationsDeleted = await Notification.deleteMany({
      $or: [
        { toUser: userId },
        { fromUser: userId }
      ]
    });
    console.log(`Deleted ${notificationsDeleted.deletedCount} notifications`);
    
    // 7. Delete all reports involving this user
    const reportsDeleted = await Report.deleteMany({
      $or: [
        { reporter: userId },
        { reportedUser: userId }
      ]
    });
    console.log(`Deleted ${reportsDeleted.deletedCount} reports`);
    
    // 8. Update audit logs to remove user references (set to null instead of deleting for audit trail)
    const auditUpdated = await Audit.updateMany(
      { admin: userId },
      { $unset: { admin: 1 } }
    );
    console.log(`Updated ${auditUpdated.modifiedCount} audit logs`);
    
    console.log(`Cascade deletion completed for user: ${userId}`);
    
  } catch (error) {
    console.error(`Error during cascade deletion for user ${userId}:`, error);
    throw error;
  }
}

// Runs for findByIdAndDelete / findOneAndDelete
userSchema.post('findOneAndDelete', async function(doc) {
  if (doc) await cascadeDeleteUserData(doc._id);
});

// Runs for doc.deleteOne()
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await cascadeDeleteUserData(this._id);
    next();
  } catch (e) { next(e); }
});

module.exports = mongoose.model('User', userSchema);