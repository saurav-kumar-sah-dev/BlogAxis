const express = require('express');
const { param, query, body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const Notification = require('../models/Notification');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const [items, total] = await Promise.all([
      Notification.find({ toUser: req.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('fromUser', 'name username avatarUrl')
        .populate('post', 'title')
        .lean(),
      Notification.countDocuments({ toUser: req.user.id, read: false })
    ]);
    res.json({ data: items, unreadCount: total, page, limit });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/read', [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, toUser: req.user.id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ toUser: req.user.id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete single notification
router.delete('/:id', [param('id').isMongoId()], handleValidation, async (req, res) => {
  try {
    const r = await Notification.deleteOne({ _id: req.params.id, toUser: req.user.id });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete all notifications for current user
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ toUser: req.user.id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


