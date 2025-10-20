# 📝 BlogAxis - Your Central Hub for Blogging

**BlogAxis** is a **full-featured, modern blog application** built with the **MERN Stack** (MongoDB, Express.js, React, Node.js). This application serves as your central hub for blogging, showcasing advanced web development practices including authentication, user profiles, image uploads, content moderation, reporting system, and comprehensive admin controls.

## 👨‍💻 Developer

**Built by [Saurav Kumar Sah](https://github.com/saurav-kumar-sah-dev)**
- **MERN Stack Developer** | Final-Year B.Tech CSE
- **GitHub**: [@saurav-kumar-sah-dev](https://github.com/saurav-kumar-sah-dev)
- **LinkedIn**: [sauravkumarsah-dev](https://www.linkedin.com/in/sauravkumarsah-dev/)
- **Portfolio**: [saurav-portfolio-dun.vercel.app](https://saurav-portfolio-dun.vercel.app/)
- **Email**: sauravshubham903@gmail.com

## 🚀 Live Application

**🌐 [Visit BlogAxis Live Application](https://blog-axis.vercel.app)**

### 🔗 Deployment Links:
- **Frontend**: [https://blog-axis.vercel.app](https://blog-axis.vercel.app) (Vercel)
- **Backend API**: [https://blogaxis.onrender.com](https://blogaxis.onrender.com) (Render)
- **Database**: MongoDB Atlas
- **Media Storage**: Cloudinary

### 🎯 Quick Start:
1. **Visit**: [https://blog-axis.vercel.app](https://blog-axis.vercel.app)
2. **Register** with email/password or **Login with Google**
3. **Create your first post** and start blogging!
4. **Explore features** like following users, commenting, and more

## 🆕 Recent Updates & Improvements

### ✨ **New Features Added:**
- **📚 My Posts Page**: Complete personal content management system
  - View all your posts (drafts, published, scheduled)
  - Filter by status and search within your content
  - Responsive design optimized for all devices
  - Quick actions for editing and managing posts
- **🗑️ Complete Account Deletion**: Comprehensive cascade deletion system
  - Removes all user data including posts, comments, follows, and notifications
  - Cleans up Cloudinary media files automatically
  - Preserves admin audit trails for compliance
- **🎯 Smart Empty States**: Context-aware user experience
  - Different actions based on login status
  - Helpful guidance for new users
  - Quick access to relevant features

### 🔧 **Technical Improvements:**
- **New API Endpoint**: `GET /posts/my` for personal post management
- **Enhanced Data Cleanup**: Automatic removal of orphaned data
- **Improved Error Handling**: Better fallback mechanisms
- **Code Optimization**: Removed unnecessary debug logs
- **Better Route Organization**: Fixed route conflicts and improved structure

## ✨ Key Features

### 🔐 **Authentication & User Management**
- **Dual Login System**: Login with email/username + password OR Google OAuth
- **Enhanced Registration**: First name, last name, date of birth, password confirmation
- **Auto-generated Usernames**: Unique usernames generated for Google users and local registrations
- **JWT Authentication**: Secure token-based authentication
- **Multi-Account Management**: Add, switch, and remove multiple user accounts
- **User Profiles**: Comprehensive user profiles with avatars, bio, location, and additional info
- **Complete Account Deletion**: Comprehensive cascade deletion system that removes:
  - All user posts and associated media from Cloudinary
  - All comments and reactions from posts/comments
  - All follow relationships (followers/following)
  - All notifications involving the user
  - All reports filed by or against the user
  - All audit trail references (preserved for admin records)

### 📝 **Blog Management & Content Creation**
- **Rich Content Types**: Support for text, images, videos, documents, and articles
- **Enhanced Post Creation**: Beautiful, intuitive post creation interface with:
  - Interactive content type selector with descriptions
  - Drag-and-drop file upload areas
  - Video trimming controls with time selection
  - Document upload with file type validation
  - Article editor for long-form content
  - Tags and categories management
  - Publishing options (draft, scheduled, published)
- **My Posts Management**: Complete personal content management system featuring:
  - **Draft Management**: Create, edit, and manage draft posts
  - **Status Filtering**: Filter posts by draft, published, or scheduled status
  - **Search Within Posts**: Search through your own content
  - **Status Badges**: Visual indicators for post status
  - **Responsive Design**: Optimized for both laptop and mobile devices
  - **Quick Actions**: Easy access to edit, delete, and publish posts
  - **Empty State Guidance**: Helpful tips and quick actions for new users
- **Professional Post Display**: Stunning post details page featuring:
  - Modern card-based layout with glass morphism effects
  - Enhanced media display with type indicators
  - Interactive like/dislike system with gradient buttons
  - Nested comment system with modern styling
  - User profile integration with hover effects
- **Image Integration**: Cloudinary-powered image uploads for posts and avatars
- **User Attribution**: Posts show author information with clickable profiles
- **Advanced Pagination**: Beautiful pagination with gradient buttons and page information
- **Enhanced Search**: Advanced search interface with icons and clear functionality
- **Content Moderation**: Report inappropriate posts and users
- **Post Visibility**: Hide/unhide posts for content moderation

### 🛡️ **Content Moderation & Reporting**
- **Report System**: Users can report inappropriate posts, comments, and users
- **Admin Moderation**: Comprehensive moderation dashboard for administrators
- **Audit Trail**: Complete logging of all admin actions and moderation decisions
- **User Management**: Suspend, unsuspend, and manage user accounts
- **Content Management**: Hide, unhide, and delete posts and comments
- **Notification System**: Real-time notifications for moderation actions

### 🎨 **Modern UI/UX & Styling**
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Beautiful Forms**: Modern, animated login and registration forms with enhanced styling
- **Gradient Headers**: Eye-catching gradient designs throughout
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Interactive Admin Dashboard**: Clickable elements for easy navigation
- **Glass Morphism Effects**: Modern backdrop blur and transparency effects
- **Enhanced Post Creation**: Beautiful, intuitive post creation interface with drag-and-drop uploads
- **Professional Post Display**: Stunning post details page with modern layout
- **Advanced Search Interface**: Enhanced search bar with icons and clear functionality
- **Modern Pagination**: Beautiful pagination with gradient buttons and page information
- **Interactive Comments**: Nested comment system with modern styling and reactions
- **Smart Empty States**: Context-aware empty states that show relevant actions:
  - **Logged-in users**: "Create Post" button for immediate content creation
  - **Logged-out users**: "Get Started" and "Sign In" buttons for account creation
  - **My Posts page**: Helpful tips and quick actions for new content creators

### 🔧 **Technical Features**
- **RESTful API**: Well-structured backend API with proper validation
- **Input Sanitization**: XSS protection and data validation
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error handling and user feedback
- **Security Headers**: Helmet.js security middleware
- **Multi-Account Support**: Token validation and account switching
- **Real-time Notifications**: WebSocket-like notification system
- **Audit Logging**: Complete tracking of administrative actions
- **Advanced API Endpoints**: 
  - **GET /posts/my**: Fetch user's own posts with filtering and search
  - **Cascade Deletion**: Automatic cleanup of all user-related data
  - **Draft Management**: Complete CRUD operations for draft posts
  - **Status Filtering**: Filter posts by draft, published, or scheduled status

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
│   │   │   ├── MyPosts.jsx
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
   # For local testing (Google Console redirect)
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Session
   SESSION_SECRET=your-session-secret
   
   # Client URLs
   # Used by server-side redirects after OAuth
   CLIENT_URL=http://localhost:5173
   # Used by CORS allowlist (comma-separated for multiple origins)
   CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
   
   # Server
   NODE_ENV=development
   PORT=5000
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
   - Frontend: http://localhost:5173
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

## 🆕 Latest Features & Styling Updates

### 🎨 **Complete UI/UX Transformation**
- **Modern Design System**: Complete redesign with glass morphism, gradients, and modern aesthetics
- **Enhanced Post Creation**: Beautiful, intuitive interface with:
  - Interactive content type selector with hover effects
  - Drag-and-drop upload areas with visual feedback
  - Video trimming interface with time controls
  - Document upload with file type validation
  - Article editor for long-form content
  - Publishing options with status indicators
- **Professional Post Display**: Stunning post details page with:
  - Glass morphism card design with backdrop blur
  - Enhanced media display with type indicators
  - Interactive like/dislike system with gradient buttons
  - Nested comment system with modern styling
  - User profile integration with hover animations
- **Advanced Search Interface**: Enhanced search bar with:
  - Search icon that changes color on focus
  - Clear button to reset search
  - Better placeholder text and visual feedback
- **Modern Pagination**: Beautiful pagination component with:
  - Gradient previous/next buttons with hover effects
  - Page information display with icons
  - Responsive layout for mobile and desktop
  - Visual indicators for current page and total posts

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

## 🎨 Design System & Styling

### Modern Design Principles
- **Glass Morphism**: Backdrop blur effects with transparency for modern aesthetics
- **Gradient System**: Beautiful color transitions throughout the interface
- **Micro-Interactions**: Subtle hover effects, scale animations, and smooth transitions
- **Responsive Design**: Mobile-first approach with perfect scaling across all devices
- **Accessibility**: High contrast ratios, focus indicators, and semantic HTML

### Color Palette
- **Primary**: Blue gradients (#3B82F6 to #8B5CF6)
- **Secondary**: Green gradients (#10B981 to #3B82F6)
- **Accent**: Purple gradients (#8B5CF6 to #EC4899)
- **Content Types**: 
  - Text: Blue (#3B82F6)
  - Image: Green (#10B981)
  - Video: Purple (#8B5CF6)
  - Document: Orange (#F59E0B)
  - Article: Indigo (#6366F1)
- **Neutral**: Gray scale for text and backgrounds
- **Status Colors**: Red (suspended), Green (active), Yellow (warning), Blue (info)

### Typography
- **Headings**: Bold, gradient text with proper hierarchy
- **Body**: Clean, readable fonts with proper spacing
- **Interactive**: Hover states and focus indicators
- **Status Text**: Color-coded text for different states

### Enhanced Components
- **Cards**: Rounded corners (2xl/3xl) with glass morphism effects and layered shadows
- **Buttons**: Gradient backgrounds with hover scale effects and smooth transitions
- **Forms**: Icon-enhanced inputs with validation feedback and focus states
- **Navigation**: Responsive header with theme toggle and smooth animations
- **Admin Panels**: Professional, organized layouts with clear actions
- **Notifications**: Rich, interactive notification system
- **Post Cards**: Modern card design with hover effects and media type indicators
- **Search Bar**: Enhanced with icons, clear functionality, and visual feedback
- **Pagination**: Beautiful gradient buttons with page information display
- **Comments**: Nested system with modern styling and reaction buttons

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure `VITE_API_BASE_URL` is set to your production API origin (without trailing /api)

### Backend (Render/Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update CORS settings for production domain(s): set `CLIENT_ORIGIN` to your frontend URL(s)

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
- ✅ **Complete UI/UX transformation with modern styling**
- ✅ **Enhanced post creation interface with drag-and-drop uploads**
- ✅ **Professional post display with glass morphism effects**
- ✅ **Advanced search interface with visual feedback**
- ✅ **Modern pagination with gradient buttons**
- ✅ **Interactive comment system with nested replies**
- ✅ **Responsive design optimized for all devices**
- ✅ **Accessibility improvements with focus indicators**
- ✅ **Micro-interactions and smooth animations throughout**

## 🚀 Deployment Status

**✅ PRODUCTION READY**

- **Frontend**: Successfully deployed on Vercel
- **Backend**: Successfully deployed on Render
- **Database**: Connected to MongoDB Atlas
- **Authentication**: Google OAuth + JWT working
- **All Features**: Fully functional and tested

### 🔧 Deployment Platforms:
- **Frontend Hosting**: [Vercel](https://vercel.com)
- **Backend Hosting**: [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Media Storage**: [Cloudinary](https://cloudinary.com)

---

**BlogAxis - Built with ❤️ using the MERN Stack - Your Central Hub for Advanced Blogging**

**🎨 Now featuring a complete UI/UX transformation with modern styling, glass morphism effects, and enhanced user experience!**

**🌐 [Live Application](https://blog-axis.vercel.app) | 📚 [GitHub Repository](https://github.com/saurav-kumar-sah-dev/BlogAxis)**

