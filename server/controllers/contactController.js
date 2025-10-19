const nodemailer = require('nodemailer');

// Create a contact form submission model (optional - for storing contact messages)
const ContactSubmission = require('../models/ContactSubmission');

exports.submitContactForm = async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Store the contact submission in database (optional)
    const contactSubmission = new ContactSubmission({
      name,
      email,
      subject,
      message,
      submittedAt: new Date(),
      status: 'pending'
    });

    await contactSubmission.save();
    console.log('Contact submission saved to database:', contactSubmission._id);

    // Send email notification (optional - requires email configuration)
    let emailStatus = 'not_configured';
    try {
      await sendContactEmail({ name, email, subject, message });
      emailStatus = 'sent';
      console.log('✅ Email notification sent successfully');
    } catch (emailError) {
      emailStatus = 'failed';
      console.log('❌ Email sending failed:', emailError.message);
      // Don't fail the request if email fails
    }

    res.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.',
      submissionId: contactSubmission._id,
      emailStatus: emailStatus
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit contact form. Please try again later.' 
    });
  }
};

// Email sending function (optional)
async function sendContactEmail({ name, email, subject, message }) {
  console.log('Attempting to send contact form email...');
  console.log('Email config check:', {
    EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET'
  });

  // Only send email if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration not found, skipping email notification');
    console.log('To enable email notifications, set these environment variables:');
    console.log('- EMAIL_HOST (e.g., smtp.gmail.com)');
    console.log('- EMAIL_USER (your email address)');
    console.log('- EMAIL_PASS (your app password)');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'sauravshubham903@gmail.com', // Always send to your email
      subject: `BlogAxis Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error; // Re-throw to be caught by the calling function
  }
}
