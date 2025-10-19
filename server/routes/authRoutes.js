const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { register, login, me, googleAuth, googleCallback, updatePassword, deleteAccount, acceptTerms } = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  [
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').isLength({ min: 8 }),
    body('dateOfBirth').optional().isISO8601(),
    body('acceptTerms').equals('true').withMessage('You must accept the terms and conditions to create an account'),
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

router.put('/password',
  auth,
  [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').isLength({ min: 8 }),
  ],
  handleValidation,
  updatePassword
);

router.delete('/account',
  auth,
  [
    body('password').isLength({ min: 1 }).withMessage('Password is required for account deletion'),
    body('confirmText').equals('DELETE').withMessage('Please type DELETE to confirm account deletion'),
    body('acceptTerms').equals('true').withMessage('You must accept the terms and conditions to delete your account'),
  ],
  handleValidation,
  deleteAccount
);

router.post('/accept-terms',
  auth,
  [
    body('acceptTerms').equals('true').withMessage('You must accept the terms and conditions'),
  ],
  handleValidation,
  acceptTerms
);

module.exports = router;