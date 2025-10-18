const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Audit = require('../models/Audit');
const Notification = require('../models/Notification');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reason, description, targetType, targetId } = req.body;
    
    // Validate target exists
    let target;
    if (targetType === 'post') {
      target = await Post.findById(targetId);
    } else if (targetType === 'user') {
      target = await User.findById(targetId);
    } else if (targetType === 'comment') {
      target = await Comment.findById(targetId);
    }
    
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    
    // Check if user already reported this target
    const existingReport = await Report.findOne({
      reporter: req.user.id,
      [`reported${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`]: targetId
    });
    
    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this content' });
    }
    
    // Create report
    const reportData = {
      reporter: req.user.id,
      reason,
      description,
      [`reported${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`]: targetId
    };
    
    const report = await Report.create(reportData);
    
    // Notify admins about new report
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        toUser: admin._id,
        fromUser: req.user.id,
        type: 'new_report',
        report: report._id
      });
    }
    
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reports for admin (with pagination and filtering)
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const reason = req.query.reason;
    const targetType = req.query.targetType;
    
    const filter = {};
    if (status) filter.status = status;
    if (reason) filter.reason = reason;
    if (targetType) filter[`reported${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`] = { $exists: true };
    
    const reports = await Report.find(filter)
      .populate('reporter', 'name username avatarUrl')
      .populate('reportedPost', 'title body user')
      .populate('reportedUser', 'name username avatarUrl')
      .populate('reportedComment', 'body user post')
      .populate('moderator', 'name username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Report.countDocuments(filter);
    
    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single report
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name username avatarUrl email')
      .populate('reportedPost', 'title body user imageUrl')
      .populate('reportedUser', 'name username avatarUrl bio')
      .populate('reportedComment', 'body user post')
      .populate('moderator', 'name username');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update report status (admin only)
exports.updateReport = async (req, res) => {
  try {
    const { status, moderationNotes, actionTaken } = req.body;
    const reportId = req.params.id;
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Update report
    report.status = status || report.status;
    report.moderator = req.user.id;
    report.moderationNotes = moderationNotes || report.moderationNotes;
    report.actionTaken = actionTaken || report.actionTaken;
    
    if (status === 'reviewing') {
      report.reviewedAt = new Date();
    } else if (status === 'resolved' || status === 'dismissed') {
      report.resolvedAt = new Date();
    }
    
    await report.save();
    
    // Create audit log
    await Audit.create({
      admin: req.user.id,
      action: 'report_reviewed',
      targetType: 'report',
      targetId: reportId,
      reason: actionTaken,
      details: moderationNotes,
      relatedReport: reportId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Take action based on actionTaken
    if (actionTaken && actionTaken !== 'none') {
      await takeModerationAction(report, actionTaken, req.user.id, moderationNotes);
    }
    
    res.json({ message: 'Report updated successfully', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to take moderation actions
async function takeModerationAction(report, action, adminId, notes) {
  try {
    if (report.reportedPost) {
      const post = await Post.findById(report.reportedPost).populate('user');
      if (post) {
        if (action === 'hide_content') {
          post.hidden = true;
          await post.save();
          
          // Notify the post author
          if (post.user && String(post.user._id) !== String(adminId)) {
            await Notification.create({
              toUser: post.user._id,
              fromUser: adminId,
              type: 'content_hidden',
              post: post._id,
              details: notes || 'Your post has been hidden due to community guidelines violation.'
            });
          }
          
          await Audit.create({
            admin: adminId,
            action: 'post_hidden',
            targetType: 'post',
            targetId: post._id,
            reason: notes,
            relatedReport: report._id
          });
        } else if (action === 'delete_content') {
          // Notify the post author before deletion
          if (post.user && String(post.user._id) !== String(adminId)) {
            await Notification.create({
              toUser: post.user._id,
              fromUser: adminId,
              type: 'content_deleted',
              post: post._id,
              details: notes || 'Your post has been deleted due to community guidelines violation.'
            });
          }
          
          await Post.findByIdAndDelete(post._id);
          
          await Audit.create({
            admin: adminId,
            action: 'post_deleted',
            targetType: 'post',
            targetId: post._id,
            reason: notes,
            relatedReport: report._id
          });
        }
      }
    }
    
    if (report.reportedUser) {
      const user = await User.findById(report.reportedUser);
      if (user) {
        if (action === 'warning') {
          // Send warning notification
          await Notification.create({
            toUser: user._id,
            fromUser: adminId,
            type: 'warning',
            details: notes || 'You have received a warning for violating community guidelines.'
          });
          
          await Audit.create({
            admin: adminId,
            action: 'user_warned',
            targetType: 'user',
            targetId: user._id,
            reason: notes,
            relatedReport: report._id
          });
        } else if (action === 'suspend_user') {
          user.suspended = true;
          await user.save();
          
          // Notify the user
          await Notification.create({
            toUser: user._id,
            fromUser: adminId,
            type: 'account_suspended',
            details: notes || 'Your account has been suspended for violating community guidelines.'
          });
          
          await Audit.create({
            admin: adminId,
            action: 'user_suspended',
            targetType: 'user',
            targetId: user._id,
            reason: notes,
            relatedReport: report._id
          });
        } else if (action === 'ban_user') {
          user.suspended = true;
          user.role = 'banned';
          await user.save();
          
          // Notify the user
          await Notification.create({
            toUser: user._id,
            fromUser: adminId,
            type: 'account_banned',
            details: notes || 'Your account has been banned for severe violations of community guidelines.'
          });
          
          await Audit.create({
            admin: adminId,
            action: 'user_banned',
            targetType: 'user',
            targetId: user._id,
            reason: notes,
            relatedReport: report._id
          });
        }
      }
    }
    
    if (report.reportedComment) {
      const comment = await Comment.findById(report.reportedComment).populate('user');
      if (comment) {
        if (action === 'delete_content') {
          // Notify the comment author before deletion
          if (comment.user && String(comment.user._id) !== String(adminId)) {
            await Notification.create({
              toUser: comment.user._id,
              fromUser: adminId,
              type: 'content_deleted',
              comment: comment._id,
              post: comment.post,
              details: notes || 'Your comment has been deleted due to community guidelines violation.'
            });
          }
          
          await Comment.findByIdAndDelete(comment._id);
          
          await Audit.create({
            admin: adminId,
            action: 'comment_deleted',
            targetType: 'comment',
            targetId: comment._id,
            reason: notes,
            relatedReport: report._id
          });
        }
      }
    }
  } catch (error) {
    console.error('Error taking moderation action:', error);
  }
}

// Get moderation statistics
exports.getModerationStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const reasonStats = await Report.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      statusStats: stats,
      reasonStats,
      recentReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
