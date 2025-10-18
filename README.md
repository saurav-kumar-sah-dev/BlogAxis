# 📝 BlogAxis - Your Central Hub for Blogging

**BlogAxis** is a **full-featured, modern blog application** built with the **MERN Stack** (MongoDB, Express.js, React, Node.js). This application serves as your central hub for blogging, showcasing advanced web development practices including authentication, user profiles, image uploads, content moderation, reporting system, and comprehensive admin controls.

## ✨ Key Features

### 🔐 **Authentication & User Management**
- **Dual Login System**: Login with email/username + password OR Google OAuth
- **Enhanced Registration**: First name, last name, date of birth, password confirmation
- **Auto-generated Usernames**: Unique usernames generated for Google users and local registrations
- **JWT Authentication**: Secure token-based authentication
- **Multi-Account Management**: Add, switch, and remove multiple user accounts
- **User Profiles**: Comprehensive user profiles with avatars, bio, location, and additional info

### 📝 **Blog Management**
- **Create & Edit Posts**: Rich blog post creation with image uploads
- **Image Integration**: Cloudinary-powered image uploads for posts and avatars
- **User Attribution**: Posts show author information with clickable profiles
- **Pagination**: Efficient post browsing with pagination
- **Search Functionality**: Find posts easily with search capabilities
- **Content Moderation**: Report inappropriate posts and users
- **Post Visibility**: Hide/unhide posts for content moderation

### 🛡️ **Content Moderation & Reporting**
- **Report System**: Users can report inappropriate posts, comments, and users
- **Admin Moderation**: Comprehensive moderation dashboard for administrators
- **Audit Trail**: Complete logging of all admin actions and moderation decisions
- **User Management**: Suspend, unsuspend, and manage user accounts
- **Content Management**: Hide, unhide, and delete posts and comments
- **Notification System**: Real-time notifications for moderation actions

### 🎨 **Modern UI/UX**
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Beautiful Forms**: Modern, animated login and registration forms
- **Gradient Headers**: Eye-catching gradient designs throughout
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Interactive Admin Dashboard**: Clickable elements for easy navigation

### 🔧 **Technical Features**
- **RESTful API**: Well-structured backend API with proper validation
- **Input Sanitization**: XSS protection and data validation
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error handling and user feedback
- **Security Headers**: Helmet.js security middleware
- **Multi-Account Support**: Token validation and account switching
- **Real-time Notifications**: WebSocket-like notification system
- **Audit Logging**: Complete tracking of administrative actions

## 🛠️ Tech Stack

| Layer      | Technology           | Purpose |
|------------|----------------------|---------|
| **Frontend** | React 18, Vite | Modern UI framework with fast development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State Management** | React Context API | Global state for auth and theme |
| **Form Handling** | React Hook Form + Zod | Type-safe form validation |
| **Routing** | React Router DOM | Client-side routing |
| **Notifications** | React Hot Toast | Beautiful toast notifications |
| **Backend** | Node.js, Express.js | RESTful API server |
| **Authentication** | JWT, Passport.js | Secure authentication with Google OAuth |
| **Database** | MongoDB, Mongoose | NoSQL database with ODM |
| **File Uploads** | Cloudinary, Multer | Image storage and processing |
| **Validation** | Express Validator | Server-side input validation |
| **Security** | Helmet, HPP, Rate Limiting | Security middleware |

## 📁 Project Structure

```
BlogAxis/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostForm.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AccountSwitcher.jsx
│   │   │   └── ReportButton.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Compose.jsx
│   │   │   ├── Edit.jsx
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── Moderation.jsx
│   │   │   └── AuditTrail.jsx
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── api/           # API client configuration
│   │   │   └── client.js
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                # Express Backend
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── userController.js
│   │   ├── accountController.js
│   │   ├── reportController.js
│   │   └── auditController.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   ├── Report.js
│   │   └── Audit.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── userRoutes.js
│   │   ├── accountRoutes.js
│   │   ├── reportRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   ├── sanitize.js
│   │   ├── validate.js
│   │   └── isAdmin.js
│   ├── config/           # Configuration files
│   │   └── passport.js
│   ├── utils/            # Utility functions
│   │   ├── cloudinary.js
│   │   └── usernameGenerator.js
│   ├── scripts/          # Database scripts
│   │   └── cleanupOrphanPosts.js
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional, for Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlogAxis
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/blog-app
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Session
   SESSION_SECRET=your-session-secret
   
   # Client URL
   CLIENT_URL=http://localhost:5174
   ```

5. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm start
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env` file

## 📱 Features Overview

### User Authentication
- **Local Registration**: Enhanced form with first name, last name, DOB, and password confirmation
- **Google OAuth**: One-click login with Google accounts
- **Dual Login**: Login with either email or username
- **Auto Username Generation**: Unique usernames for all users
- **Multi-Account Management**: Add, switch, and remove multiple user accounts
- **Token Validation**: Secure account switching with token verification

### User Profiles
- **Comprehensive Profiles**: Bio, location, additional info, avatar uploads
- **Profile Editing**: Users can edit their own profiles
- **Public Profiles**: View other users' profiles (read-only)
- **Avatar Management**: Upload, change, or remove profile pictures
- **Account Switching**: Seamlessly switch between multiple accounts

### Blog Features
- **Rich Post Creation**: Title, content, and image uploads
- **Post Management**: Edit and delete your own posts
- **User Attribution**: See who wrote each post with clickable profiles
- **Pagination**: Browse posts efficiently
- **Search**: Find posts by content
- **Content Reporting**: Report inappropriate posts and users
- **Post Visibility**: Hide/unhide posts for moderation

### Admin & Moderation Features
- **Admin Dashboard**: Comprehensive admin panel with user and post management
- **Content Moderation**: Review and moderate reported content
- **User Management**: Suspend, unsuspend, and manage user accounts
- **Audit Trail**: Complete logging of all administrative actions
- **Report System**: Handle user reports for posts, comments, and users
- **Notification System**: Real-time notifications for moderation actions
- **Interactive Navigation**: Clickable elements for easy content access

### UI/UX
- **Dark/Light Theme**: Toggle with persistent preferences
- **Responsive Design**: Works perfectly on all devices
- **Modern Forms**: Beautiful, animated login and registration forms
- **Smooth Animations**: Hover effects and transitions throughout
- **Professional Design**: Gradient headers and modern styling
- **Interactive Elements**: Clickable navigation throughout the application
- **Enhanced Notifications**: Rich notification system with icons and actions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Sanitization**: XSS protection with DOMPurify
- **Rate Limiting**: API protection against abuse
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcrypt for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Validation**: Both client and server-side validation
- **Admin Authorization**: Role-based access control for admin features
- **Audit Logging**: Complete tracking of all administrative actions
- **Content Moderation**: Automated and manual content filtering

## 🆕 Latest Features

### Multi-Account Management
- **Account Switching**: Users can add multiple accounts and switch between them
- **Token Validation**: Secure validation of account tokens before switching
- **Account Storage**: Local storage of multiple user sessions
- **Seamless Experience**: Smooth transitions between different user accounts

### Content Moderation System
- **Report Functionality**: Users can report inappropriate posts, comments, and users
- **Admin Dashboard**: Comprehensive moderation interface for administrators
- **Content Management**: Hide, unhide, and delete posts and comments
- **User Management**: Suspend, unsuspend, and manage user accounts
- **Audit Trail**: Complete logging of all administrative actions

### Enhanced Notifications
- **Rich Notifications**: Icons, colors, and detailed messages
- **Clickable Navigation**: Click notifications to navigate to relevant content
- **Real-time Updates**: Instant notifications for moderation actions
- **Smart Routing**: Notifications link to appropriate pages (posts, profiles, moderation)

### Interactive Admin Dashboard
- **Clickable Elements**: All users, posts, and content are clickable for easy navigation
- **Centralized Management**: All admin functions in one organized dashboard
- **Visual Feedback**: Hover effects and clear action indicators
- **Efficient Workflow**: Quick access to all administrative functions

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradients (#3B82F6 to #8B5CF6)
- **Secondary**: Green gradients (#10B981 to #3B82F6)
- **Accent**: Purple gradients (#8B5CF6 to #EC4899)
- **Neutral**: Gray scale for text and backgrounds
- **Status Colors**: Red (suspended), Green (active), Yellow (warning), Blue (info)

### Typography
- **Headings**: Bold, gradient text with proper hierarchy
- **Body**: Clean, readable fonts with proper spacing
- **Interactive**: Hover states and focus indicators
- **Status Text**: Color-coded text for different states

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Icon-enhanced inputs with validation feedback
- **Navigation**: Responsive header with theme toggle
- **Admin Panels**: Professional, organized layouts with clear actions
- **Notifications**: Rich, interactive notification system

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API URLs for production

### Backend (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update CORS settings for production domain

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update `MONGO_URI` in your environment variables
3. Configure network access and database users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TechnoHacks** for the internship opportunity
- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **Cloudinary** for image management services
- **Express.js** for the robust backend framework
- **JWT** for secure authentication
- **Passport.js** for OAuth integration

## 📈 Project Evolution

This blog application has evolved from a basic CRUD application to a comprehensive content management platform with:

- ✅ **Multi-account management system**
- ✅ **Advanced content moderation tools**
- ✅ **Comprehensive reporting system**
- ✅ **Real-time notification system**
- ✅ **Complete audit trail logging**
- ✅ **Interactive admin dashboard**
- ✅ **Enhanced security features**
- ✅ **Professional UI/UX design**

---

**BlogAxis - Built with ❤️ using the MERN Stack - Your Central Hub for Advanced Blogging**

