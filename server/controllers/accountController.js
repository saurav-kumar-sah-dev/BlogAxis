const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sign = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Get all accounts for a user (for account switching)
exports.getUserAccounts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user has access to this user's accounts
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId).select('name email username avatarUrl role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info that can be used for account switching
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate a token and return user info (for account switching)
exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email username avatarUrl role suspended');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.suspended) {
        return res.status(403).json({ error: 'Account suspended' });
      }

      res.json({
        valid: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          role: user.role,
          suspended: user.suspended
        }
      });
    } catch (jwtError) {
      res.json({ valid: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate a new token for account switching
exports.generateToken = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user has access to this user's accounts
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId).select('role suspended');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.suspended) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    const token = sign(user._id, user.role);
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
