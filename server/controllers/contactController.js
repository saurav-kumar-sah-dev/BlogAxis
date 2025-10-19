const nodemailer = require('nodemailer');

// Create a contact form submission model (optional - for storing contact messages)
const ContactSubmission = require('../models/ContactSubmission');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

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

    // Send email notification (optional - requires email configuration)
    try {
      await sendContactEmail({ name, email, subject, message });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
      // Don't fail the request if email fails
    }

    res.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.',
      submissionId: contactSubmission._id
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
  // Only send email if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email configuration not found, skipping email notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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

  await transporter.sendMail(mailOptions);
  console.log('Contact form email sent successfully');
}
