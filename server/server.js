require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const documentRoutes = require('./routes/documentRoutes');
const accountRoutes = require('./routes/accountRoutes');
const reportRoutes = require('./routes/reportRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { searchUsers } = require('./controllers/userController');
const sanitizeRequest = require('./middleware/sanitize');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Behind proxies/load balancers in production (e.g., Render), enable trust proxy
// This fixes rate-limit warnings regarding X-Forwarded-For and ensures correct IP detection
app.set('trust proxy', NODE_ENV === 'production' ? 1 : false);

// CORS first
const allowedOrigins = (process.env.CLIENT_ORIGIN?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'https://blog-axis.vercel.app'
]).map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    console.log('CORS request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS allowed for origin: no origin');
      return cb(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowed for origin:', origin);
      return cb(null, true);
    }
    
    // Allow any Vercel preview URL (contains vercel.app)
    if (origin.includes('vercel.app')) {
      console.log('CORS allowed for Vercel origin:', origin);
      return cb(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Security
app.use(helmet());
app.use(hpp());

// Body parser then sanitize user input (in-place)
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeRequest);

// Rate limit (softer in development, and skip GET feed endpoints)
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'development' ? 3000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (NODE_ENV === 'development' && req.method === 'GET') return true; // no rate limit on GET in dev
    // Allow unauthenticated GETs to posts/users in production as well
    if (req.method === 'GET' && (/^\/api\/posts/.test(req.originalUrl) || /^\/api\/users\/search/.test(req.originalUrl))) return true;
    return false;
  },
});
app.use('/api', apiRateLimiter);

// Health check (useful to test CORS quickly)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
// Ensure documents directory exists and also serve it statically for direct access
try {
  const fs = require('fs');
  const documentsDir = path.join(__dirname, 'uploads/documents');
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  app.use('/api/documents', express.static(documentsDir));
} catch (e) {
  console.warn('Warning: could not initialize documents static hosting:', e?.message);
}
app.use('/api/documents', documentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);

// DB
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit the process if DB connection fails
});

// Serve frontend (only if present). In this deployment, frontend is hosted separately (Vercel),
// so skip serving if the build directory doesn't exist to avoid 500s.
if (NODE_ENV === 'production') {
  const fs = require('fs');
  const clientPath = path.join(__dirname, '../frontend/dist');
  const indexPath = path.join(clientPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    app.use(express.static(clientPath));
    app.get(/^\/(?!api).*/, (req, res) => res.sendFile(indexPath));
  } else {
    console.warn(`Frontend build not found at ${indexPath}; skipping static hosting. Frontend is served from Vercel.`);
    // Provide a helpful root response instead of a 500 when hitting the service root
    app.get('/', (req, res) => res.json({
      status: 'ok',
      service: 'BlogAxis API',
      docs: '/api/health',
      frontend: 'https://blog-axis.vercel.app'
    }));
  }
}

// Error handler to avoid silent 500s
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));