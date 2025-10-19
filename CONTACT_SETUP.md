# 📧 Contact Form Email Setup Guide

## Current Status
The contact form is working and saving submissions to the database, but email notifications are not configured. This guide will help you set up email notifications.

## Quick Fix - Email Configuration

### Option 1: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Set Environment Variables** in your Render deployment:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=sauravshubham903@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_PORT=587
```

### Option 2: Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_PORT=587
```

#### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_PORT=587
```

## How to Update Environment Variables in Render

1. Go to your Render dashboard
2. Select your BlogAxis API service
3. Go to "Environment" tab
4. Add the email variables above
5. Click "Save Changes"
6. The service will automatically redeploy

## Testing the Setup

### Test Endpoints Available:

1. **Email Configuration Check**:
   ```
   GET https://blogaxis.onrender.com/api/contact/email-config
   ```

2. **Test Contact Submission**:
   ```
   POST https://blogaxis.onrender.com/api/contact/test
   Content-Type: application/json
   
   {
     "name": "Test User",
     "email": "test@example.com",
     "subject": "Test",
     "message": "This is a test message"
   }
   ```

## Current Behavior

### Without Email Configuration:
- ✅ Contact form submissions are saved to database
- ✅ Users get immediate success response
- ❌ No email notifications sent
- ✅ Admin can view submissions in database

### With Email Configuration:
- ✅ Contact form submissions are saved to database
- ✅ Users get immediate success response
- ✅ Email notifications sent to sauravshubham903@gmail.com
- ✅ Admin can view submissions in database

## Troubleshooting

### Common Issues:

1. **"Request timeout" error**:
   - ✅ Fixed: Email sending now happens in background
   - Contact form responds immediately
   - No more timeout issues

2. **"Email configuration not found"**:
   - Set the environment variables in Render
   - Redeploy the service

3. **"Authentication failed"**:
   - Use App Password for Gmail (not regular password)
   - Ensure 2FA is enabled

4. **"Connection timeout"**:
   - Check EMAIL_HOST and EMAIL_PORT
   - Try different email provider

5. **"Email sent but not received"** (NEW ISSUE):
   - Check spam/junk folder
   - Verify email address is correct
   - Check Gmail's "Less secure app access" settings
   - Try different email provider
   - Check server logs for delivery details

### Email Delivery Troubleshooting:

#### If emails are sent but not received:

1. **Check Spam/Junk Folder**:
   - Gmail often filters automated emails
   - Look for emails from your configured EMAIL_USER

2. **Gmail Specific Issues**:
   - Enable "Less secure app access" (if using regular password)
   - Use App Password instead of regular password
   - Check Gmail's security settings

3. **Test Email Delivery**:
   ```bash
   # Test email sending
   curl -X POST https://blogaxis.onrender.com/api/contact/test-email
   
   # Check email configuration
   curl https://blogaxis.onrender.com/api/contact/email-config
   ```

4. **Alternative Email Providers**:
   - Try Outlook/Hotmail instead of Gmail
   - Use a dedicated email service like SendGrid
   - Consider using a business email account

5. **Check Server Logs**:
   - Look for "Email result" in Render logs
   - Check if messageId is generated
   - Verify accepted/rejected arrays

## Database Access

Contact submissions are stored in MongoDB with the following structure:

```javascript
{
  name: "User Name",
  email: "user@example.com", 
  subject: "Subject",
  message: "Message content",
  status: "pending", // pending, read, replied, closed
  submittedAt: Date,
  adminNotes: "Optional admin notes"
}
```

## Next Steps

1. **Set up email configuration** using the steps above
2. **Test the contact form** to ensure emails are sent
3. **Monitor the logs** in Render dashboard for any issues
4. **Consider adding admin dashboard** to view contact submissions

## Security Notes

- App passwords are more secure than regular passwords
- Environment variables are encrypted in Render
- Email credentials are not exposed in client-side code
- Contact form has rate limiting and validation

---

**Need Help?** Check the Render logs or contact the development team.