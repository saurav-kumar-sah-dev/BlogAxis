const express = require('express');
const multer = require('multer');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { handleValidation } = require('../middleware/validate');
const { deleteMe, getUserPublic, getMe, updateMe, searchUsers, followUser, unfollowUser, listFollowers, listFollowing } = require('../controllers/userController');

const router = express.Router();

// Public endpoints (no auth)
router.get('/search', optionalAuth, searchUsers);
router.get('/:id/followers', optionalAuth, [param('id').isMongoId()], handleValidation, listFollowers);
router.get('/:id/following', optionalAuth, [param('id').isMongoId()], handleValidation, listFollowing);

// Protected routes (must come before /:id to avoid conflicts)
router.use(auth);

router.get('/me', getMe);

// Upload middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only images are allowed'));
  },
});

const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    return res.status(400).json({ error: err?.message || 'Upload failed' });
  });
};

        router.put('/me',
          uploadAvatar,
          [
            body('firstName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 50 }),
            body('lastName').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 50 }),
            body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 50 }),
            body('username').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 30 }).toLowerCase(),
            body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
            body('place').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
            body('info').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
            body('dateOfBirth').optional({ checkFalsy: true }).isISO8601(),
            body('removeAvatar').optional({ checkFalsy: true }).isIn(['true', 'false']),
          ],
          handleValidation,
          updateMe
        );

router.delete('/me', deleteMe);

// Follow / Unfollow (must be BEFORE public :id route)
router.post('/:id/follow', [param('id').isMongoId()], handleValidation, followUser);
router.post('/:id/unfollow', [param('id').isMongoId()], handleValidation, unfollowUser);

// Public profile by id (read-only) - must be after /me to avoid conflicts
router.get('/:id', [param('id').isMongoId()], handleValidation, getUserPublic);

module.exports = router;