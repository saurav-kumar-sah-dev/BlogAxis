const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { handleValidation } = require('../middleware/validate');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Audit = require('../models/Audit');
const { getAudits, getAuditStats } = require('../controllers/auditController');

const router = express.Router();

// All admin routes require auth + admin
router.use(auth, isAdmin);

// Users list (admins see all users, including other admins)
router.get('/users', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const [items, total] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-password').lean(),
      User.countDocuments(),
    ]);
    res.json({ data: items, total, page, limit });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user role
router.put('/users/:id/role', [param('id').isMongoId(), body('role').isIn(['user','admin'])], handleValidation, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Suspend/Unsuspend user
router.put('/users/:id/suspend', [param('id').isMongoId(), body('suspended').isBoolean()], handleValidation, async (req, res) => {
  try {
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Update user
    user.suspended = req.body.suspended;
    await user.save();
    
    // Notify the user if they're not the admin
    if (String(user._id) !== String(req.user.id)) {
      await Notification.create({
        toUser: user._id,
        fromUser: req.user.id,
        type: req.body.suspended ? 'account_suspended' : 'account_unsuspended',
        details: req.body.reason || (req.body.suspended ? 'Your account has been suspended by an administrator' : 'Your account has been unsuspended by an administrator')
      });
    }
    
    // Create audit log
    await Audit.create({
      admin: req.user.id,
      action: req.body.suspended ? 'user_suspended' : 'user_unsuspended',
      targetType: 'user',
      targetId: user._id,
      reason: req.body.reason || (req.body.suspended ? 'User suspended by admin' : 'User unsuspended by admin'),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete user (admin)
router.delete('/users/:id', [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Notify the user before deletion if they're not the admin
    if (String(user._id) !== String(req.user.id)) {
      await Notification.create({
        toUser: user._id,
        fromUser: req.user.id,
        type: 'account_deleted',
        details: 'Your account has been deleted by an administrator'
      });
    }
    
    // Create audit log before deletion
    await Audit.create({
      admin: req.user.id,
      action: 'user_deleted',
      targetType: 'user',
      targetId: user._id,
      reason: 'User deleted by admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Posts list
router.get('/posts', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const [items, total] = await Promise.all([
      Post.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name username').lean(),
      Post.countDocuments(),
    ]);
    res.json({ data: items, total, page, limit });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a post (admin)
router.delete('/posts/:id', [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Notify the post author before deletion if they're not the admin
    if (post.user && String(post.user._id) !== String(req.user.id)) {
      await Notification.create({
        toUser: post.user._id,
        fromUser: req.user.id,
        type: 'content_deleted',
        post: post._id,
        details: 'Your post has been deleted by an administrator'
      });
    }
    
    // Create audit log before deletion
    await Audit.create({
      admin: req.user.id,
      action: 'post_deleted',
      targetType: 'post',
      targetId: post._id,
      reason: 'Post deleted by admin',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (e) {
    console.error('Error deleting post:', e);
    res.status(500).json({ error: e.message });
  }
});

// Hide/Unhide post
router.put('/posts/:id/hidden', [param('id').isMongoId(), body('hidden').isBoolean()], handleValidation, async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Update post
    post.hidden = req.body.hidden;
    await post.save();
    
    // Notify the post author if they're not the admin
    if (post.user && String(post.user._id) !== String(req.user.id)) {
      await Notification.create({
        toUser: post.user._id,
        fromUser: req.user.id,
        type: req.body.hidden ? 'content_hidden' : 'content_unhidden',
        post: post._id,
        details: req.body.reason || (req.body.hidden ? 'Your post has been hidden by an administrator' : 'Your post has been made visible by an administrator')
      });
    }
    
    // Create audit log
    await Audit.create({
      admin: req.user.id,
      action: req.body.hidden ? 'post_hidden' : 'post_unhidden',
      targetType: 'post',
      targetId: post._id,
      reason: req.body.reason || (req.body.hidden ? 'Post hidden by admin' : 'Post unhidden by admin'),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Audit trail routes
router.get('/audits',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
    query('targetType').optional().isString(),
    query('admin').optional().isString()
  ],
  handleValidation,
  getAudits
);

router.get('/audits/stats', getAuditStats);

module.exports = router;


