# 🚀 Fix Email in Deployed Environment (Render)

## Problem
- ✅ **Local**: Email works perfectly
- ❌ **Deployed (Render)**: Only database works, email fails

## Root Cause
Environment variables are not set in your Render deployment.

## Quick Fix (5 minutes)

### Step 1: Go to Render Dashboard
1. Open [Render Dashboard](https://dashboard.render.com)
2. Find your **BlogAxis API** service
3. Click on it

### Step 2: Add Environment Variables
1. Click **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add these 4 variables:

```
EMAIL_HOST = smtp.gmail.com
EMAIL_USER = sauravshubham903@gmail.com
EMAIL_PASS = your-16-character-app-password
EMAIL_PORT = 587
```

### Step 3: Save & Deploy
1. Click **"Save Changes"**
2. Render will automatically redeploy (2-3 minutes)

## Get Gmail App Password

### If you don't have an App Password:
1. Go to [Google Account](https://myaccount.google.com)
2. **Security** → **2-Step Verification** → **App passwords**
3. Select **"Mail"** and generate password
4. Copy the 16-character password
5. Use this in `EMAIL_PASS` (not your regular Gmail password)

## Test After Deployment

### Check Configuration:
```bash
curl https://blogaxis.onrender.com/api/contact/email-config
```

### Test Email:
```bash
curl -X POST https://blogaxis.onrender.com/api/contact/test-email
```

### Test Contact Form:
Visit: https://blog-axis.vercel.app/contact

## Expected Results

### Before Fix:
```json
{
  "status": "not_configured",
  "config": {
    "EMAIL_HOST": "NOT SET",
    "EMAIL_USER": "NOT SET",
    "EMAIL_PASS": "NOT SET"
  }
}
```

### After Fix:
```json
{
  "status": "configured",
  "config": {
    "EMAIL_HOST": "SET",
    "EMAIL_USER": "SET", 
    "EMAIL_PASS": "SET",
    "EMAIL_HOST_VALUE": "smtp.gmail.com",
    "EMAIL_USER_VALUE": "sauravshubham903@gmail.com",
    "EMAIL_PASS_LENGTH": 16
  }
}
```

## Troubleshooting

### If still not working:

1. **Check Render Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for email-related errors

2. **Verify App Password**:
   - Make sure you're using App Password (16 characters)
   - Not your regular Gmail password

3. **Check Gmail Settings**:
   - 2FA must be enabled
   - App Password must be generated

4. **Try Different Email**:
   - Test with a different email address
   - Try Outlook instead of Gmail

## Common Issues

### "Authentication failed":
- Use App Password, not regular password
- Ensure 2FA is enabled

### "Connection timeout":
- Check EMAIL_HOST and EMAIL_PORT
- Try different email provider

### "Email sent but not received":
- Check spam folder
- Verify recipient email address
- Check Gmail security settings

---

**Need Help?** Check the logs in Render Dashboard or test the endpoints above.
