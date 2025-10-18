const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { getUserAccounts, validateToken, generateToken } = require('../controllers/accountController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user account info for switching
router.get('/:userId',
  [param('userId').isMongoId()],
  handleValidation,
  getUserAccounts
);

// Validate a token
router.post('/validate-token',
  [body('token').isString().notEmpty()],
  handleValidation,
  validateToken
);

// Generate a new token for account switching
router.post('/:userId/token',
  [param('userId').isMongoId()],
  handleValidation,
  generateToken
);

module.exports = router;
