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

## Prerequisites

### 1. MongoDB Atlas Setup
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (choose the free tier)
4. Create a database user with read/write permissions
5. Get your connection string (replace `<password>` with your user password)
6. Whitelist your IP address (or use 0.0.0.0/0 for all IPs in development)

### 2. Cloudinary Setup
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard

## Deployment Steps

### 1. Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" and import your BlogAxis repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-render-app.onrender.com/api`
5. Click "Deploy"

### 2. Backend (Render)
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your BlogAxis repository
4. Configure the service:
   - **Name**: `blogaxis-api`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`
5. Add all environment variables from the list above
6. Click "Create Web Service"
7. Deploy automatically on every push

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

## Troubleshooting

### Common Issues:

#### Frontend (Vercel) Issues:
- **Build fails**: Check if all dependencies are in package.json
- **Environment variables not working**: Ensure VITE_ prefix is used
- **API calls failing**: Verify VITE_API_BASE_URL is correct

#### Backend (Render) Issues:
- **Build fails**: Check if server/package.json exists and has correct scripts
- **Environment variables**: Ensure all required variables are set in Render dashboard
- **Database connection**: Verify MONGO_URI is correct and database is accessible
- **CORS errors**: Update CLIENT_ORIGIN with your Vercel URL

#### Database Issues:
- **Connection timeout**: Check IP whitelist in MongoDB Atlas
- **Authentication failed**: Verify username/password in connection string
- **Database not found**: MongoDB Atlas will create the database automatically

### Useful Commands:
```bash
# Test local backend
cd server && npm start

# Test local frontend
cd client && npm run dev

# Check environment variables
echo $MONGO_URI
echo $VITE_API_BASE_URL
```

## Final Checklist

Before going live:
- [ ] MongoDB Atlas cluster is running
- [ ] Cloudinary account is set up
- [ ] All environment variables are configured
- [ ] Frontend is deployed on Vercel
- [ ] Backend is deployed on Render
- [ ] CORS is configured correctly
- [ ] Test all major features (login, posts, uploads)

Your BlogAxis application is ready for production! 🎉
