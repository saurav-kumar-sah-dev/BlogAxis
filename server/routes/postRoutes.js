const express = require('express');
const multer = require('multer');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { handleValidation } = require('../middleware/validate');
const { createPost, getPosts, getPostById, updatePost, deletePost, likePost, dislikePost, listComments, addComment, toggleCommentReaction, deleteComment, updateComment, getPopularPosts } = require('../controllers/postController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Accept different media fields depending on type
const uploadAny = (req, res, next) => {
  // Use memory storage for all file types initially
  // The controller will handle saving documents to disk
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 },
  ])(req, res, (err) => {
    if (!err) return next();
    return res.status(400).json({ error: err?.message || 'Upload failed' });
  });
};

// PUBLIC
router.get('/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('search').optional().isString().trim(),
  ],
  handleValidation,
  getPosts
);

router.get('/popular', optionalAuth, getPopularPosts);

router.get('/:id',
  [param('id').isMongoId()],
  handleValidation,
  getPostById
);

// Comments list is public
router.get('/:id/comments', [param('id').isMongoId()], handleValidation, listComments);

// PROTECTED (everything below requires auth)
router.use(auth);

router.post('/',
  uploadAny,
  [
    body('title').trim().isLength({ min: 1, max: 140 }),
    body('body').trim().isLength({ min: 1, max: 5000 }),
    body('type').optional().isIn(['text', 'image', 'video', 'document', 'article']),
    body('videoStart').optional().isInt({ min: 0, max: 150 }).toInt(),
    body('videoEnd').optional().isInt({ min: 0, max: 150 }).toInt(),
  ],
  handleValidation,
  createPost
);

// Reactions
router.post('/:id/like', [param('id').isMongoId()], handleValidation, likePost);
router.post('/:id/dislike', [param('id').isMongoId()], handleValidation, dislikePost);

// Comments (protected for add/delete/react)
router.post('/:id/comments', [param('id').isMongoId(), body('body').trim().isLength({ min: 1, max: 2000 })], handleValidation, addComment);
router.post('/:id/comments/:commentId/reaction', [param('id').isMongoId(), param('commentId').isMongoId()], handleValidation, toggleCommentReaction);
router.delete('/:id/comments/:commentId', [param('id').isMongoId(), param('commentId').isMongoId()], handleValidation, deleteComment);
router.put('/:id/comments/:commentId', [param('id').isMongoId(), param('commentId').isMongoId(), body('body').trim().isLength({ min: 1, max: 2000 })], handleValidation, updateComment);

router.put('/:id',
  uploadAny,
  [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 1, max: 140 }),
    body('body').optional().trim().isLength({ min: 1, max: 5000 }),
    body('type').optional().isIn(['text', 'image', 'video', 'document', 'article']),
    body('videoStart').optional().isInt({ min: 0, max: 150 }).toInt(),
    body('videoEnd').optional().isInt({ min: 0, max: 150 }).toInt(),
  ],
  handleValidation,
  updatePost
);

router.delete('/:id',
  [param('id').isMongoId()],
  handleValidation,
  deletePost
);

module.exports = router;