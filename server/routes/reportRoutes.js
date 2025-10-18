const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { handleValidation } = require('../middleware/validate');
const { 
  createReport, 
  getReports, 
  getReport, 
  updateReport, 
  getModerationStats 
} = require('../controllers/reportController');

const router = express.Router();

// Create a report (authenticated users)
router.post('/',
  auth,
  [
    body('reason').isIn([
      'spam', 'harassment', 'hate_speech', 'inappropriate_content', 
      'fake_news', 'copyright_violation', 'violence', 'nudity', 'other'
    ]),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('targetType').isIn(['post', 'user', 'comment']),
    body('targetId').isMongoId()
  ],
  handleValidation,
  createReport
);

// Get reports (admin only)
router.get('/',
  auth,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'reviewing', 'resolved', 'dismissed']),
    query('reason').optional().isString(),
    query('targetType').optional().isIn(['post', 'user', 'comment'])
  ],
  handleValidation,
  getReports
);

// Get moderation statistics (admin only)
router.get('/stats',
  auth,
  isAdmin,
  getModerationStats
);

// Get single report (admin only)
router.get('/:id',
  auth,
  isAdmin,
  [param('id').isMongoId()],
  handleValidation,
  getReport
);

// Update report (admin only)
router.put('/:id',
  auth,
  isAdmin,
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['pending', 'reviewing', 'resolved', 'dismissed']),
    body('moderationNotes').optional().isString().isLength({ max: 1000 }),
    body('actionTaken').optional().isIn([
      'none', 'warning', 'hide_content', 'delete_content', 'suspend_user', 'ban_user'
    ])
  ],
  handleValidation,
  updateReport
);

module.exports = router;
