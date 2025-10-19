const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadBuffer, destroy } = require('../utils/cloudinary');

// Public: lightweight user search by name/username/place (excludes admins for non-admins)
exports.searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    
    // Build a forgiving regex: any substring match, case-insensitive
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    
    // Role-based filtering: non-admins can't see admin users
    const isAdmin = req.user?.role === 'admin';
    const roleFilter = isAdmin ? {} : { role: { $ne: 'admin' } };
    
    const users = await User.find({ 
      $and: [
        { $or: [
          { name: regex },
          { username: regex },
          { place: regex },
        ]},
        roleFilter,
        { suspended: { $ne: true } } // Exclude suspended users
      ]
    })
      .select('name username place avatarUrl')
      .limit(10)
      .lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id); // cascade runs via post('findOneAndDelete')
    res.json({ message: 'Account and posts deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getUserPublic = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const user = await User.findById(req.params.id)
      .select('name username bio avatarUrl createdAt updatedAt firstName lastName place info dateOfBirth followers following isGoogleUser acceptTerms')
      .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const authUserId = req.user?.id || req.user?._id;
    const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
    const followingCount = Array.isArray(user.following) ? user.following.length : 0;
    const isFollowing = authUserId ? (user.followers || []).some(id => String(id) === String(authUserId)) : false;
    res.json({
      ...user,
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email username bio avatarUrl createdAt updatedAt firstName lastName place info dateOfBirth followers following isGoogleUser acceptTerms')
      .lean();
    const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
    const followingCount = Array.isArray(user.following) ? user.following.length : 0;
    res.json({ user: { ...user, followersCount, followingCount } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Basic fields
    if (typeof req.body.firstName === 'string') user.firstName = req.body.firstName;
    if (typeof req.body.lastName === 'string') user.lastName = req.body.lastName;
    // If explicit full name provided, use it; otherwise compute from first/last
    if (typeof req.body.name === 'string' && req.body.name.trim().length > 0) {
      user.name = req.body.name;
    } else if (typeof req.body.firstName === 'string' || typeof req.body.lastName === 'string') {
      const computed = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (computed) user.name = computed;
    }
    if (typeof req.body.username === 'string') user.username = req.body.username.toLowerCase();
    if (typeof req.body.bio === 'string') user.bio = req.body.bio;
    if (typeof req.body.place === 'string') user.place = req.body.place;
    if (typeof req.body.info === 'string') user.info = req.body.info;
    if (req.body.dateOfBirth) user.dateOfBirth = new Date(req.body.dateOfBirth);

    // Avatar upload or removal
    if (req.file) {
      if (user.avatarPublicId) {
        try { await destroy(user.avatarPublicId); } catch (e) {}
      }
      const result = await uploadBuffer(req.file.buffer, 'blog/avatars');
      user.avatarUrl = result.secure_url;
      user.avatarPublicId = result.public_id;
    } else if (req.body.removeAvatar === 'true') {
      if (user.avatarPublicId) {
        try { await destroy(user.avatarPublicId); } catch (e) {}
      }
      user.avatarUrl = undefined;
      user.avatarPublicId = undefined;
    }

    await user.save();
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      place: user.place,
      info: user.info,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      isGoogleUser: user.isGoogleUser,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res.json(payload);
  } catch (e) {
    if (e.code === 11000 && e.keyPattern && e.keyPattern.username) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: e.message });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid id' });
    if (String(targetId) === String(meId)) return res.status(400).json({ error: 'Cannot follow yourself' });

    const [me, target] = await Promise.all([
      User.findById(meId).select('following'),
      User.findById(targetId).select('followers'),
    ]);
    if (!target) return res.status(404).json({ error: 'User not found' });

    const alreadyFollowing = (me.following || []).some(id => String(id) === String(targetId));
    if (alreadyFollowing) {
      return res.status(200).json({ message: 'Already following' });
    }

    me.following = [...(me.following || []), targetId];
    target.followers = [...(target.followers || []), meId];

    await Promise.all([me.save(), target.save()]);

    // Notify target
    try { await Notification.create({ toUser: targetId, fromUser: meId, type: 'follow' }); } catch {}

    res.json({
      message: 'Followed',
      followersCount: (target.followers || []).length,
      followingCount: (me.following || []).length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid id' });
    if (String(targetId) === String(meId)) return res.status(400).json({ error: 'Cannot unfollow yourself' });

    const [me, target] = await Promise.all([
      User.findById(meId).select('following'),
      User.findById(targetId).select('followers'),
    ]);
    if (!target) return res.status(404).json({ error: 'User not found' });

    const wasFollowing = (me.following || []).some(id => String(id) === String(targetId));
    if (!wasFollowing) {
      return res.status(200).json({ message: 'Not following' });
    }

    me.following = (me.following || []).filter(id => String(id) !== String(targetId));
    target.followers = (target.followers || []).filter(id => String(id) !== String(meId));

    await Promise.all([me.save(), target.save()]);

    res.json({
      message: 'Unfollowed',
      followersCount: (target.followers || []).length,
      followingCount: (me.following || []).length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// List followers of a user with follow state relative to current user
exports.listFollowers = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user?.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid id' });
    const target = await User.findById(targetId).select('followers');
    if (!target) return res.status(404).json({ error: 'User not found' });
    const followerIds = target.followers || [];
    if (followerIds.length === 0) return res.json([]);
    
    // Role-based filtering: non-admins can't see admin users
    const isAdmin = req.user?.role === 'admin';
    const roleFilter = isAdmin ? {} : { role: { $ne: 'admin' } };
    
    const [users, myFollowing] = await Promise.all([
      User.find({ 
        _id: { $in: followerIds },
        ...roleFilter,
        suspended: { $ne: true }
      })
        .select('name username place avatarUrl')
        .lean(),
      meId ? User.findById(meId).select('following').lean() : Promise.resolve({ following: [] })
    ]);
    const myFollowingSet = new Set((myFollowing?.following || []).map(id => String(id)));
    const payload = users.map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      place: u.place,
      avatarUrl: u.avatarUrl,
      isFollowing: myFollowingSet.has(String(u._id)),
    }));
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// List users that target is following, with follow state relative to current user
exports.listFollowing = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user?.id;
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid id' });
    const target = await User.findById(targetId).select('following');
    if (!target) return res.status(404).json({ error: 'User not found' });
    const followingIds = target.following || [];
    if (followingIds.length === 0) return res.json([]);
    
    // Role-based filtering: non-admins can't see admin users
    const isAdmin = req.user?.role === 'admin';
    const roleFilter = isAdmin ? {} : { role: { $ne: 'admin' } };
    
    const [users, myFollowing] = await Promise.all([
      User.find({ 
        _id: { $in: followingIds },
        ...roleFilter,
        suspended: { $ne: true }
      })
        .select('name username place avatarUrl')
        .lean(),
      meId ? User.findById(meId).select('following').lean() : Promise.resolve({ following: [] })
    ]);
    const myFollowingSet = new Set((myFollowing?.following || []).map(id => String(id)));
    const payload = users.map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      place: u.place,
      avatarUrl: u.avatarUrl,
      isFollowing: myFollowingSet.has(String(u._id)),
    }));
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
