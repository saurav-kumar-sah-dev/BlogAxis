const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { register, login, me, googleAuth, googleCallback } = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  [
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
    body('dateOfBirth').optional().isISO8601(),
  ],
  handleValidation,
  register
);

router.post('/login',
  [
    body('emailOrUsername').trim().isLength({ min: 1 }),
    body('password').isLength({ min: 6 }),
  ],
  handleValidation,
  login
);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/me', auth, me);

module.exports = router;