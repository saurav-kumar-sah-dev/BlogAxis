const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

// Health check for contact routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Contact routes are working' });
});

// Test endpoint for contact form submission
router.post('/test', (req, res) => {
  console.log('Test contact endpoint hit with data:', req.body);
  res.json({ 
    status: 'ok', 
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test email sending endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { sendContactEmail } = require('../controllers/contactController');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Email',
      message: 'This is a test email to verify email delivery is working.'
    };
    
    console.log('Testing email sending...');
    const result = await sendContactEmail(testData);
    
    res.json({
      status: 'success',
      message: 'Test email sent successfully',
      result: {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        response: result.response
      }
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Test email failed',
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    });
  }
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
