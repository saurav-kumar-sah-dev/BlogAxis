const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateUsername } = require('../utils/usernameGenerator');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.isGoogleUser = true;
      user.avatarUrl = profile.photos[0]?.value;
      if (!user.username) {
        const emailPrefix = (profile.emails[0]?.value || '').split('@')[0] || 'user';
        const genFirst = user.firstName || profile.name?.givenName || emailPrefix;
        const genLast = user.lastName || profile.name?.familyName || '';
        user.username = await generateUsername(genFirst, genLast);
      }
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';
    
    // Generate unique username
    const emailPrefix = (profile.emails[0]?.value || '').split('@')[0] || 'user';
    const username = await generateUsername(firstName || emailPrefix, lastName);
    
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: name,
      firstName: firstName,
      lastName: lastName,
      username: username,
      avatarUrl: profile.photos[0]?.value,
      isGoogleUser: true
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
