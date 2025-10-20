// controllers/postController.js
const mongoose = require('mongoose'); 
const Post = require('../models/Post'); 
const { uploadBuffer, destroy } = require('../utils/cloudinary');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const path = require('path');

exports.createPost = async (req, res) => {
  try {
    const type = req.body.type || 'text';
    const doc = {
      user: req.user.id,
      title: req.body.title,
      body: req.body.body,
      type,
    // tags/categories/status/schedule
    tags: (req.body.tags ? String(req.body.tags).split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : []),
    categories: (req.body.categories ? String(req.body.categories).split(',').map(s => s.trim()).filter(Boolean) : []),
    status: req.body.status === 'draft' ? 'draft' : (req.body.status === 'scheduled' ? 'scheduled' : 'published'),
    };

    // Handle uploads based on type
    if (type === 'image' && req.files?.image) {
      const images = req.files.image;
      if (images.length === 1) {
        // Single image
        const result = await uploadBuffer(images[0].buffer, 'blog/posts', 'image');
        doc.imageUrl = result.secure_url; 
        doc.imagePublicId = result.public_id;
        doc.mediaUrl = result.secure_url; 
        doc.mediaPublicId = result.public_id; 
        doc.mediaMimeType = images[0].mimetype;
      } else {
        // Multiple images
        const uploadPromises = images.map(file => uploadBuffer(file.buffer, 'blog/posts', 'image'));
        const results = await Promise.all(uploadPromises);
        
        doc.imageUrl = results.map(r => r.secure_url);
        doc.imagePublicId = results.map(r => r.public_id);
        doc.mediaUrl = results.map(r => r.secure_url);
        doc.mediaPublicId = results.map(r => r.public_id);
        doc.mediaMimeType = images.map(img => img.mimetype);
      }
    }

    if (type === 'document' && req.files?.document?.[0]) {
      const file = req.files.document[0];
      const originalName = file.originalname || 'document';
      const fileSize = file.size || 0;
      
      // Upload document to Cloudinary for persistent storage
      const result = await uploadBuffer(file.buffer, 'blog/documents', 'raw');
      
      doc.docUrl = result.secure_url;
      doc.docPublicId = result.public_id;
      doc.docMimeType = file.mimetype;
      doc.docOriginalName = originalName;
      doc.docSize = fileSize;
      doc.mediaUrl = result.secure_url;
      doc.mediaPublicId = result.public_id;
      doc.mediaMimeType = file.mimetype;
    }

    if (type === 'video' && req.files?.video?.[0]) {
      // Limit: only up to 150s (2m30s). If client provides start/end, request trimming via Cloudinary eager transformation.
      const start = Math.max(0, Number(req.body.videoStart || 0));
      const end = Math.min(150, Number(req.body.videoEnd || 150));
      const duration = Math.max(0, Math.min(150, end - start));
      const extra = duration > 0 ? { eager: [{ resource_type: 'video', transformation: [{ start_offset: start, end_offset: end }] }] } : {};
      const result = await uploadBuffer(req.files.video[0].buffer, 'blog/videos', 'video', extra);
      // If eager was used, prefer its URL; otherwise use original
      const eagerUrl = result.eager && result.eager[0] && (result.eager[0].secure_url || result.eager[0].url);
      doc.videoUrl = eagerUrl || result.secure_url; doc.videoPublicId = result.public_id; doc.videoDurationSec = Math.min(150, duration || Math.round(result.duration || 0));
      doc.mediaUrl = doc.videoUrl; doc.mediaPublicId = result.public_id; doc.mediaMimeType = req.files.video[0].mimetype;
    }


    if (type === 'article') {
      doc.articleContent = req.body.articleContent || '';
    }

  // Schedule/publish timestamps
  if (doc.status === 'published') {
    doc.publishedAt = new Date();
  } else if (doc.status === 'scheduled') {
    const when = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    if (when && !isNaN(when.getTime())) doc.scheduledAt = when;
  }

    const post = await Post.create(doc);
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getPopularPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const now = new Date();
    const postQuery = {
      $or: [ { status: { $exists: false } }, { status: 'published' }, { status: 'scheduled', scheduledAt: { $lte: now } } ],
      hidden: { $ne: true }
    };
    const items = await Post.find(postQuery)
    .sort({ views: -1, createdAt: -1 })
    .limit(limit)
    .populate({ 
      path: 'user', 
      select: 'name username avatarUrl role suspended',
      match: { suspended: { $ne: true } }
    })
    .lean();
    
    // Filter out posts where user population failed (suspended/admin users)
    const filteredItems = items.filter(item => item.user);
    res.json({ data: filteredItems });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = req.query.search || '';
    const now = new Date();

    // Only published or scheduled in the past; drafts only for owner (handled in separate endpoints ideally)
    const visibility = {
      $or: [
        { status: { $exists: false } },
        { status: 'published' },
        { status: 'scheduled', scheduledAt: { $lte: now } },
      ],
      hidden: { $ne: true } // Exclude hidden posts
    };

    const match = (search
      ? {
          $and: [visibility, {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { body: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
            { categories: { $regex: search, $options: 'i' } },
            ]
          }]
        }
      : visibility);

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $match: { 'user.0': { $exists: true } } },
      // Filter out posts from suspended users (posts remain visible regardless of author role)
      {
        $addFields: {
          userRole: { $arrayElemAt: ['$user.role', 0] },
          userSuspended: { $arrayElemAt: ['$user.suspended', 0] }
        }
      },
      {
        $match: {
          userSuspended: { $ne: true },
          
        }
      },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $unwind: '$user' },
            { $project: { 'user.password': 0, 'user.email': 0 } },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Post.aggregate(pipeline).allowDiskUse(true);
    const data = result?.data || [];
    const total = result?.total?.[0]?.count || 0;

    res.json({
      data,
      page,
      limit,
      total,
      hasPrev: page > 1,
      hasNext: page * limit < total,
    });
  } catch (e) {
    // Fallback: simple query with populate to avoid taking down the feed
    try {
      console.error('getPosts aggregate failed, falling back:', e?.message || e);
      const query = search ? { $or: [ { title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } } ] } : {};
      const [items, count] = await Promise.all([
        Post.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate({ path: 'user', select: '-password -email' })
          .lean(),
        Post.countDocuments(query),
      ]);
      res.json({
        data: items,
        page,
        limit,
        total: count,
        hasPrev: page > 1,
        hasNext: page * limit < count,
      });
    } catch (e2) {
      console.error('getPosts fallback failed:', e2?.message || e2);
      res.status(500).json({ error: e2.message || 'Failed to load posts' });
    }
  }
};

// controllers/postController.js
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    
    return res.json(post);
  } catch (e) {
    console.error('getPostById error:', {
      id: req.params.id,
      name: e.name,
      message: e.message,
      stack: e.stack, // Add stack trace for debugging
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (String(post.user) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    if (typeof req.body.title === 'string') post.title = req.body.title;
    if (typeof req.body.body === 'string') post.body = req.body.body;
    if (typeof req.body.type === 'string') post.type = req.body.type;
    if (typeof req.body.tags === 'string') post.tags = req.body.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (typeof req.body.categories === 'string') post.categories = req.body.categories.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof req.body.status === 'string' && ['draft','scheduled','published'].includes(req.body.status)) post.status = req.body.status;
    if (req.body.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
    if (req.body.scheduledAt) {
      const when = new Date(req.body.scheduledAt);
      if (!isNaN(when.getTime())) post.scheduledAt = when;
    }

    // Replace media depending on type & files
    if (req.files?.image) {
      const images = req.files.image;
      
      // Clean up old images
      if (post.imagePublicId) {
        if (Array.isArray(post.imagePublicId)) {
          await Promise.all(post.imagePublicId.map(id => destroy(id).catch(() => {})));
        } else {
          await destroy(post.imagePublicId).catch(() => {});
        }
      }
      if (post.mediaPublicId && post.mediaPublicId !== post.imagePublicId) {
        if (Array.isArray(post.mediaPublicId)) {
          await Promise.all(post.mediaPublicId.map(id => destroy(id).catch(() => {})));
        } else {
          await destroy(post.mediaPublicId).catch(() => {});
        }
      }
      
      if (images.length === 1) {
        // Single image
        const result = await uploadBuffer(images[0].buffer, 'blog/posts', 'image');
        post.imageUrl = result.secure_url; 
        post.imagePublicId = result.public_id;
        post.mediaUrl = result.secure_url; 
        post.mediaPublicId = result.public_id; 
        post.mediaMimeType = images[0].mimetype;
      } else {
        // Multiple images
        const uploadPromises = images.map(file => uploadBuffer(file.buffer, 'blog/posts', 'image'));
        const results = await Promise.all(uploadPromises);
        
        post.imageUrl = results.map(r => r.secure_url);
        post.imagePublicId = results.map(r => r.public_id);
        post.mediaUrl = results.map(r => r.secure_url);
        post.mediaPublicId = results.map(r => r.public_id);
        post.mediaMimeType = images.map(img => img.mimetype);
      }
      post.type = 'image';
    }

    if (req.files?.document?.[0]) {
      // Clean up old document from Cloudinary
      if (post.docPublicId) {
        await destroy(post.docPublicId).catch(() => {});
      }
      if (post.mediaPublicId && post.mediaPublicId !== post.docPublicId) {
        await destroy(post.mediaPublicId).catch(() => {});
      }
      
      // Handle new document upload to Cloudinary
      const file = req.files.document[0];
      const originalName = file.originalname || 'document';
      const fileSize = file.size || 0;
      
      const result = await uploadBuffer(file.buffer, 'blog/documents', 'raw');
      
      post.docUrl = result.secure_url;
      post.docPublicId = result.public_id;
      post.docMimeType = file.mimetype;
      post.docOriginalName = originalName;
      post.docSize = fileSize;
      post.mediaUrl = result.secure_url;
      post.mediaPublicId = result.public_id;
      post.mediaMimeType = file.mimetype;
      post.type = 'document';
    }

    if (req.files?.video?.[0]) {
      if (post.videoPublicId) { try { await destroy(post.videoPublicId); } catch (e) {} }
      if (post.mediaPublicId && post.mediaPublicId !== post.videoPublicId) { try { await destroy(post.mediaPublicId); } catch (e) {} }
      const start = Math.max(0, Number(req.body.videoStart || 0));
      const end = Math.min(150, Number(req.body.videoEnd || 150));
      const duration = Math.max(0, Math.min(150, end - start));
      const extra = duration > 0 ? { eager: [{ resource_type: 'video', transformation: [{ start_offset: start, end_offset: end }] }] } : {};
      const result = await uploadBuffer(req.files.video[0].buffer, 'blog/videos', 'video', extra);
      const eagerUrl = result.eager && result.eager[0] && (result.eager[0].secure_url || result.eager[0].url);
      post.videoUrl = eagerUrl || result.secure_url; post.videoPublicId = result.public_id; post.videoDurationSec = Math.min(150, duration || Math.round(result.duration || 0));
      post.mediaUrl = post.videoUrl; post.mediaPublicId = result.public_id; post.mediaMimeType = req.files.video[0].mimetype;
      post.type = 'video';
    }


    if (typeof req.body.articleContent === 'string') {
      post.articleContent = req.body.articleContent;
      post.type = 'article';
    }

    const updated = await post.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (String(post.user) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    // Clean up images (handle both single and multiple)
    if (post.imagePublicId) {
      if (Array.isArray(post.imagePublicId)) {
        await Promise.all(post.imagePublicId.map(id => destroy(id).catch(() => {})));
      } else {
        try { await destroy(post.imagePublicId); } catch (e) {}
      }
    }
    if (post.videoPublicId) { try { await destroy(post.videoPublicId); } catch (e) {} }
    
    // Handle document deletion from Cloudinary
    if (post.docPublicId) {
      try { await destroy(post.docPublicId); } catch (e) {}
    }
    
    // Clean up media (handle both single and multiple)
    if (post.mediaPublicId && !post.mediaPublicId.startsWith('document-')) {
      if (Array.isArray(post.mediaPublicId)) {
        await Promise.all(post.mediaPublicId.map(id => destroy(id).catch(() => {})));
      } else {
        try { await destroy(post.mediaPublicId); } catch (e) {}
      }
    }
    await Post.findByIdAndDelete(req.params.id);
    // Also delete comments for this post
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Reaction helpers
async function toggleInArray(doc, field, userId) {
  const arr = doc[field] || [];
  const strId = String(userId);
  const has = arr.some(id => String(id) === strId);
  if (has) {
    doc[field] = arr.filter(id => String(id) !== strId);
  } else {
    doc[field] = [...arr, userId];
  }
}

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('likes dislikes user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user already liked the post
    const wasLiked = (post.likes || []).some(id => String(id) === String(req.user.id));
    
    // Add/remove like, and ensure dislike removed if existed
    await toggleInArray(post, 'likes', req.user.id);
    post.dislikes = (post.dislikes || []).filter(id => String(id) !== String(req.user.id));
    await post.save();
    
    // Create like notification only when liking (not unliking) and not for own posts
    try {
      const isNowLiked = (post.likes || []).some(id => String(id) === String(req.user.id));
      if (!wasLiked && isNowLiked && String(post.user) !== String(req.user.id)) {
        await Notification.create({ toUser: post.user, fromUser: req.user.id, type: 'like_post', post: post._id });
      }
    } catch {}
    
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length, liked: post.likes.some(id => String(id) === String(req.user.id)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('likes dislikes user');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user already disliked the post
    const wasDisliked = (post.dislikes || []).some(id => String(id) === String(req.user.id));
    
    // Add/remove dislike, and ensure like removed if existed
    await toggleInArray(post, 'dislikes', req.user.id);
    post.likes = (post.likes || []).filter(id => String(id) !== String(req.user.id));
    await post.save();
    
    // Create dislike notification only when disliking (not undisliking) and not for own posts
    try {
      const isNowDisliked = (post.dislikes || []).some(id => String(id) === String(req.user.id));
      if (!wasDisliked && isNowDisliked && String(post.user) !== String(req.user.id)) {
        await Notification.create({ toUser: post.user, fromUser: req.user.id, type: 'dislike_post', post: post._id });
      }
    } catch {}
    
    res.json({ likes: post.likes.length, dislikes: post.dislikes.length, disliked: post.dislikes.some(id => String(id) === String(req.user.id)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Comments
exports.listComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const parent = req.query.parent || null;
    const match = { post: postId, parent: parent || null };
    const [items, total] = await Promise.all([
      Comment.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'user', select: 'name username avatarUrl' })
        .lean(),
      Comment.countDocuments(match),
    ]);
    res.json({ data: items, page, limit, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const parent = req.body.parent || null;
    const body = (req.body.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Comment is empty' });
    const created = await Comment.create({ post: postId, user: req.user.id, parent: parent || null, body });
    const doc = await Comment.findById(created._id).populate({ path: 'user', select: 'name username avatarUrl' }).lean();
    try {
      const post = await Post.findById(postId).select('user');
      if (post && String(post.user) !== String(req.user.id)) {
        await Notification.create({ toUser: post.user, fromUser: req.user.id, type: parent ? 'reply' : 'comment', post: postId, comment: created._id });
      }
    } catch {}
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.toggleCommentReaction = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { type } = req.body; // 'like' | 'dislike'
    if (!['like', 'dislike'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const comment = await Comment.findById(commentId).select('likes dislikes');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (type === 'like') {
      await toggleInArray(comment, 'likes', req.user.id);
      comment.dislikes = (comment.dislikes || []).filter(uid => String(uid) !== String(req.user.id));
    } else {
      await toggleInArray(comment, 'dislikes', req.user.id);
      comment.likes = (comment.likes || []).filter(uid => String(uid) !== String(req.user.id));
    }
    await comment.save();
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const c = await Comment.findById(commentId);
    if (!c) return res.status(404).json({ error: 'Comment not found' });
    if (String(c.user) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    // Delete comment and its replies
    await Comment.deleteMany({ $or: [ { _id: commentId }, { parent: commentId } ] });
    res.json({ message: 'Comment deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const body = (req.body.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Comment is empty' });
    const c = await Comment.findById(commentId);
    if (!c) return res.status(404).json({ error: 'Comment not found' });
    if (String(c.user) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    c.body = body;
    await c.save();
    const doc = await Comment.findById(c._id).populate({ path: 'user', select: 'name username avatarUrl' }).lean();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get user's own posts including drafts
exports.getMyPosts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const status = req.query.status; // 'draft', 'published', 'scheduled', or undefined for all
    const search = req.query.search || '';

    // Build query for user's own posts
    let query = { user: req.user.id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'user', select: 'name username avatarUrl' })
        .lean(),
      Post.countDocuments(query)
    ]);

    res.json({
      data: posts,
      page,
      limit,
      total,
      hasPrev: page > 1,
      hasNext: page * limit < total,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};