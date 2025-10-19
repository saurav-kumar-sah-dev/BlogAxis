const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

// Contact form submission
router.post('/submit',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
    body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
  ],
  handleValidation,
  submitContactForm
);

module.exports = router;
