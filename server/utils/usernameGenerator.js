const User = require('../models/User');

// Generate a unique username based on name
async function generateUsername(firstName, lastName) {
  const baseName = `${firstName}${lastName ? lastName : ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try the base name first
  let username = baseName;
  let counter = 1;
  
  while (true) {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return username;
    }
    
    // If base name is taken, try with numbers
    username = `${baseName}${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 9999) {
      // Fallback to random string
      username = `${baseName}${Math.random().toString(36).substr(2, 4)}`;
      const finalCheck = await User.findOne({ username });
      if (!finalCheck) {
        return username;
      }
    }
  }
}

module.exports = { generateUsername };
