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
const { searchUsers } = require('./controllers/userController');
const sanitizeRequest = require('./middleware/sanitize');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS first
const allowedOrigins = (process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'https://blog-axis.vercel.app']).map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    console.log('CORS request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('CORS allowed for origin:', origin);
      cb(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      cb(new Error('Not allowed by CORS'));
    }
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
app.use('/api/documents', documentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/reports', reportRoutes);

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

// Serve frontend (Express 5-safe regex, not "*")
if (NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(clientPath));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
}

// Error handler to avoid silent 500s
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));