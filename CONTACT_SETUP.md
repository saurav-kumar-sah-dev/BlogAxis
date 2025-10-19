# Contact Form Setup

## Overview
The contact form is now fully functional with backend support. It includes:
- Form validation
- Database storage of contact submissions
- Email notifications to sauravshubham903@gmail.com
- Error handling

## Developer Contact
- **Email**: sauravshubham903@gmail.com
- **GitHub**: [@saurav-kumar-sah-dev](https://github.com/saurav-kumar-sah-dev)
- **LinkedIn**: [sauravkumarsah-dev](https://www.linkedin.com/in/sauravkumarsah-dev/)
- **Portfolio**: [saurav-portfolio-dun.vercel.app](https://saurav-portfolio-dun.vercel.app/)

## Backend Features

### Contact Form Submission
- **Endpoint**: `POST /api/contact/submit`
- **Validation**: Name, email, subject, and message validation
- **Storage**: Contact submissions are stored in MongoDB
- **Response**: Success/error messages with submission ID

### Database Model
Contact submissions are stored with the following fields:
- `name`: User's full name
- `email`: User's email address
- `subject`: Contact form subject
- `message`: User's message
- `status`: pending/read/replied/closed
- `submittedAt`: Timestamp
- `repliedAt`: When admin replied (optional)
- `adminNotes`: Admin notes (optional)

## Email Notifications (Optional)

To enable email notifications when contact forms are submitted, add these environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@blogaxis.com
```

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for your application
3. Use the app password in `EMAIL_PASS`

### Other Email Providers
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's SMTP settings

## Frontend Features

### Contact Page (`/contact`)
- Responsive contact form
- Real-time validation
- Success/error message display
- FAQ section
- Contact information display

### Form Fields
- **Name**: Required, 1-100 characters
- **Email**: Required, valid email format
- **Subject**: Required, 1-200 characters (dropdown selection)
- **Message**: Required, 10-2000 characters

## Testing

### Test Contact Form
1. Navigate to `/contact`
2. Fill out the form with test data
3. Submit the form
4. Check for success message
5. Verify data is stored in database

### Test Email (if configured)
1. Submit a contact form
2. Check admin email for notification
3. Verify email contains all form data

## Admin Features (Future Enhancement)

Consider adding admin features to:
- View all contact submissions
- Mark submissions as read/replied
- Add admin notes
- Reply to submissions directly from admin panel

## Security Features

- Input validation and sanitization
- Rate limiting on contact endpoint
- XSS protection
- CSRF protection via same-origin policy
- Email validation and normalization

## Dependencies Added

- `nodemailer`: For email functionality
- `ContactSubmission` model: For database storage

## Files Created/Modified

### New Files
- `server/routes/contactRoutes.js`
- `server/controllers/contactController.js`
- `server/models/ContactSubmission.js`
- `client/src/pages/Privacy.jsx`
- `client/src/pages/Contact.jsx`
- `client/src/pages/About.jsx`

### Modified Files
- `server/server.js` (added contact routes)
- `server/package.json` (added nodemailer dependency)
- `client/src/App.jsx` (added new page routes)
- `client/src/components/Footer.jsx` (updated links)
- `client/src/pages/Contact.jsx` (integrated with backend API)

## Status: ✅ Fully Functional

All footer links now work properly:
- Privacy Policy → `/privacy` ✅
- Contact → `/contact` ✅
- About Us → `/about` ✅
- Terms & Conditions → `/terms` ✅

The contact form is fully integrated with the backend and ready for production use.
