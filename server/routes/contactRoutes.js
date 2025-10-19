const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

// Health check for contact routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Contact routes are working' });
});

// Email configuration check endpoint
router.get('/email-config', (req, res) => {
  const emailConfig = {
    EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || '587 (default)'
  };
  
  res.json({
    status: 'ok',
    message: 'Email configuration status',
    config: emailConfig,
    instructions: {
      setup: 'To enable email notifications, set these environment variables in your deployment:',
      variables: [
        'EMAIL_HOST=smtp.gmail.com',
        'EMAIL_USER=your-email@gmail.com',
        'EMAIL_PASS=your-app-password',
        'EMAIL_PORT=587'
      ],
      gmailSetup: [
        '1. Enable 2-factor authentication on your Gmail account',
        '2. Generate an "App Password" for your application',
        '3. Use the app password in EMAIL_PASS'
      ]
    }
  });
});

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
