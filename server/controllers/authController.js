const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { generateUsername } = require('../utils/usernameGenerator');
const { validateAge } = require('../utils/ageValidation');

const sign = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, dateOfBirth, acceptTerms } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Age validation - must be 13 or older
    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }
    
    const ageValidation = validateAge(dateOfBirth, 13);
    if (!ageValidation.isValid) {
      return res.status(400).json({ error: ageValidation.error });
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
      dateOfBirth: new Date(dateOfBirth),
      acceptTerms: acceptTerms === 'true' || acceptTerms === true
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
        acceptTerms: user.acceptTerms,
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
        acceptTerms: user.acceptTerms,
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
    
    // Check if user has accepted terms
    if (!user.acceptTerms) {
      // Generate a temporary token for terms acceptance
      const tempToken = sign(user._id, user.role);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${tempToken}&terms_required=true`);
    }
    
    // Generate JWT token
    const token = sign(user._id, user.role);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  })(req, res, next);
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      return res.status(400).json({ error: 'Password cannot be changed for Google OAuth accounts' });
    }
    
    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password, confirmText } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // For Google OAuth users, skip password verification
    if (user.password) {
      // Verify password for local accounts
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }
    
    // Additional confirmation check
    if (confirmText !== 'DELETE') {
      return res.status(400).json({ error: 'Please type DELETE to confirm account deletion' });
    }
    
    // Delete the user (this will trigger cascade delete for posts and images)
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.acceptTerms = async (req, res) => {
  try {
    const { acceptTerms } = req.body;
    
    if (acceptTerms !== true && acceptTerms !== 'true') {
      return res.status(400).json({ error: 'You must accept the terms and conditions' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Update user's terms acceptance
    user.acceptTerms = true;
    await user.save();
    
    res.json({ 
      message: 'Terms and conditions accepted successfully',
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
        acceptTerms: user.acceptTerms,
        isGoogleUser: user.isGoogleUser,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.updateDateOfBirth = async (req, res) => {
  try {
    const { dateOfBirth } = req.body;
    
    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Age validation - must be 13 or older
    const ageValidation = validateAge(dateOfBirth, 13);
    if (!ageValidation.isValid) {
      return res.status(400).json({ error: ageValidation.error });
    }
    
    // Update user's date of birth
    user.dateOfBirth = new Date(dateOfBirth);
    await user.save();
    
    res.json({ 
      message: 'Date of birth updated successfully',
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
        acceptTerms: user.acceptTerms,
        isGoogleUser: user.isGoogleUser,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};