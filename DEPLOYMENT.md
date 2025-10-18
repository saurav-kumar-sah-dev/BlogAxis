# 🚀 BlogAxis Deployment Guide

## Environment Variables Setup

### Server Environment Variables (.env)
Create a `.env` file in the `server` directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/blog-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Configuration
SESSION_SECRET=your-session-secret

# Server Configuration
NODE_ENV=production
PORT=5000

# Client URL (for CORS)
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

### Frontend Environment Variables (Vercel)
Set the following environment variable in Vercel:

```
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
```

## Deployment Steps

### 1. Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_BASE_URL`
5. Deploy!

### 2. Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Configure environment variables in Render dashboard
6. Deploy automatically on every push

## Security Checklist
- ✅ Environment variables are set
- ✅ CORS is configured for production domain
- ✅ Rate limiting is enabled
- ✅ Helmet security headers are active
- ✅ Input sanitization is working
- ✅ JWT secrets are strong and unique

## Performance Optimization
- ✅ Static files are served efficiently
- ✅ Database connections are optimized
- ✅ Image uploads use Cloudinary CDN
- ✅ Frontend is built and minified

## Monitoring
- Set up error logging
- Monitor database performance
- Track API response times
- Monitor user engagement

Your BlogAxis application is ready for production! 🎉
