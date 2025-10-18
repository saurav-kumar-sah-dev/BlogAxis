const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { generateUsername } = require('../utils/usernameGenerator');

const sign = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, dateOfBirth } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    
    // Generate username
    // Auto-generate a unique username from names; fallback to email prefix if names missing
    const emailPrefix = (email || '').split('@')[0] || 'user';
    const username = await generateUsername(firstName || emailPrefix, lastName || '');
    
    // Create user
    const name = `${firstName} ${lastName}`.trim();
    const user = await User.create({ 
      firstName, 
      lastName, 
      name, 
      email, 
      password, 
      username,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
    });
    
    const token = sign(user._id, user.role);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        place: user.place,
        info: user.info,
        role: user.role,
        suspended: user.suspended,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    
    if (!user || !user.password || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = sign(user._id, user.role);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        place: user.place,
        info: user.info,
        role: user.role,
        suspended: user.suspended,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('name email username avatarUrl firstName lastName dateOfBirth place info role suspended createdAt updatedAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        place: user.place,
        info: user.info,
        role: user.role,
        suspended: user.suspended,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Google OAuth routes
exports.googleAuth = (req, res, next) => {
  // Force account chooser to avoid sticky sessions and ensure a clean auth each time
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    }
    
    // Generate JWT token
    const token = sign(user._id, user.role);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  })(req, res, next);
};