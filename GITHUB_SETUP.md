# 🐙 GitHub Setup Guide for BlogAxis

## Step 1: Create GitHub Repository

### Option A: Create Repository on GitHub.com
1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Fill in the details:
   ```
   Repository name: BlogAxis
   Description: BlogAxis - Your Central Hub for Blogging. A full-featured blog application built with MERN stack.
   Visibility: Public (or Private if you prefer)
   Initialize with: README (uncheck this - we already have one)
   Add .gitignore: None (we'll add our own)
   Choose a license: MIT License
   ```
4. Click "Create repository"

### Option B: Create Repository via Command Line
```bash
# Navigate to your project directory
cd "E:\improtent\Projects\Projects\Major Projects\Blog-Application"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: BlogAxis - Your Central Hub for Blogging"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/saurav-kumar-sah-dev/BlogAxis.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Repository Structure

Your repository should have this structure:
```
BlogAxis/
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── GITHUB_SETUP.md
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── server/                 # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── package.json
│   └── ...
└── uploads/               # Local file uploads (gitignored)
```

## Step 3: Important Files to Commit

✅ **DO Commit:**
- All source code files
- package.json files
- README.md
- DEPLOYMENT.md
- .gitignore
- Configuration files (vite.config.js, tailwind.config.js, etc.)

❌ **DON'T Commit:**
- node_modules/ (handled by .gitignore)
- .env files (handled by .gitignore)
- dist/ or build/ folders (handled by .gitignore)
- uploads/ folder (handled by .gitignore)
- Log files
- IDE configuration files

## Step 4: Repository Settings

### Enable GitHub Pages (Optional)
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Save

### Set up Branch Protection (Recommended)
1. Go to Settings → Branches
2. Add rule for "main" branch
3. Enable "Require pull request reviews"
4. Enable "Require status checks to pass"

## Step 5: GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd client && npm install
        cd ../server && npm install
    
    - name: Build frontend
      run: cd client && npm run build
    
    - name: Test backend
      run: cd server && npm test
```

## Step 6: Repository Description

Update your repository description with:
```
BlogAxis - Your Central Hub for Blogging

A full-featured, modern blog application built with the MERN Stack (MongoDB, Express.js, React, Node.js). Features include:

✨ Multi-account management
🛡️ Advanced content moderation
📱 Responsive design with dark/light theme
🔐 JWT authentication + Google OAuth
📝 Rich content creation (text, images, videos, documents)
🚀 Real-time notifications
👥 User following system
📊 Admin dashboard with audit trail

Built with React, Node.js, MongoDB, Tailwind CSS, and Cloudinary.
```

## Step 7: Topics/Tags

Add these topics to your repository:
- blog
- react
- nodejs
- mongodb
- express
- tailwindcss
- mern-stack
- fullstack
- web-application
- content-management
- authentication
- real-time

## Step 8: README Badges

Add these badges to your README.md:
```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6+-green.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3+-blue.svg)
```

## Next Steps

After setting up GitHub:
1. ✅ Repository created and code pushed
2. ✅ Repository renamed to BlogAxis
3. 🔄 Set up MongoDB Atlas database
4. 🔄 Deploy backend to Render
5. 🔄 Deploy frontend to Vercel
6. 🔄 Configure environment variables
7. 🔄 Test complete deployment

## Troubleshooting

### Common Issues:
- **Large files**: Use Git LFS for large files
- **Sensitive data**: Double-check .gitignore includes .env files
- **Build errors**: Ensure all dependencies are in package.json
- **Permission issues**: Check repository permissions

### Useful Commands:
```bash
# Check git status
git status

# Add specific files
git add filename

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

Your BlogAxis repository is now ready for deployment! 🚀
