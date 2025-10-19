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

    // Store the contact submission in database
    const contactSubmission = new ContactSubmission({
      name,
      email,
      subject,
      message,
      submittedAt: new Date(),
      status: 'pending'
    });

    await contactSubmission.save();
    console.log('✅ Contact submission saved to database:', contactSubmission._id);

    // Send email notification asynchronously (don't wait for it)
    let emailStatus = 'not_configured';
    
    // Check if email is configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('📧 Email configuration found, attempting to send email...');
      console.log('Email config:', {
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USER,
        port: process.env.EMAIL_PORT || 587,
        hasPassword: !!process.env.EMAIL_PASS
      });
      
      // Send email in background (don't await)
      sendContactEmail({ name, email, subject, message })
        .then((result) => {
          console.log('✅ Email notification sent successfully');
          console.log('Email result:', {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            response: result.response
          });
          // Update status in database
          ContactSubmission.findByIdAndUpdate(contactSubmission._id, { 
            status: 'read',
            adminNotes: `Email sent successfully - Message ID: ${result.messageId}`
          }).catch(err => console.log('Failed to update email status:', err));
        })
        .catch((emailError) => {
          console.log('❌ Email sending failed:', emailError.message);
          console.log('Email error details:', {
            code: emailError.code,
            command: emailError.command,
            response: emailError.response,
            errno: emailError.errno,
            syscall: emailError.syscall
          });
          // Update status in database
          ContactSubmission.findByIdAndUpdate(contactSubmission._id, { 
            adminNotes: `Email failed: ${emailError.message}`
          }).catch(err => console.log('Failed to update email error status:', err));
        });
      
      emailStatus = 'sending';
    } else {
      console.log('❌ Email configuration not found, skipping email notification');
      console.log('Missing config:', {
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS
      });
      emailStatus = 'not_configured';
    }

    // Respond immediately without waiting for email
    res.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.',
      submissionId: contactSubmission._id,
      emailStatus: emailStatus,
      note: emailStatus === 'not_configured' ? 'Email notifications are not configured. Your message has been saved and will be reviewed manually.' : 'Your message has been received and we\'ll respond via email.'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit contact form. Please try again later.' 
    });
  }
};

// Email sending function with timeout and better error handling
async function sendContactEmail({ name, email, subject, message }) {
  console.log('Attempting to send contact form email...');
  
  // Only send email if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration not found, skipping email notification');
    console.log('To enable email notifications, set these environment variables:');
    console.log('- EMAIL_HOST (e.g., smtp.gmail.com)');
    console.log('- EMAIL_USER (your email address)');
    console.log('- EMAIL_PASS (your app password)');
    throw new Error('Email configuration not found');
  }

  // Create transporter with timeout settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 10000,     // 10 seconds
    // Retry settings
    pool: true,
    maxConnections: 1,
    maxMessages: 1,
  });

  try {
    // Verify transporter configuration with timeout
    console.log('Verifying email transporter...');
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email verification timeout')), 15000)
      )
    ]);
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: `"BlogAxis Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'sauravshubham903@gmail.com', // Always send to your email
      replyTo: email, // Allow replying directly to the sender
      subject: `BlogAxis Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            <em>Submitted at: ${new Date().toLocaleString()}</em><br>
            <em>From: BlogAxis Contact Form</em><br>
            <em>Reply directly to: ${email}</em>
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Submitted at: ${new Date().toLocaleString()}
From: BlogAxis Contact Form

Reply directly to: ${email}
      `,
      // Add headers to help with delivery
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'normal'
      }
    };

    // Send email with timeout
    console.log('Sending email...');
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 30000)
      )
    ]);
    
    console.log('✅ Contact form email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      errno: error.errno,
      syscall: error.syscall
    });
    throw error; // Re-throw to be caught by the calling function
  } finally {
    // Close the transporter
    try {
      transporter.close();
    } catch (closeError) {
      console.log('Warning: Failed to close email transporter:', closeError.message);
    }
  }
}
