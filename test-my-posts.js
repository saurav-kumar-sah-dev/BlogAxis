// Test script to verify My Posts functionality
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

async function testMyPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/Blog-Application');
    console.log('Connected to MongoDB');

    // Find a user with posts
    const userWithPosts = await User.findOne().lean();
    if (!userWithPosts) {
      console.log('No users found in database');
      return;
    }

    console.log(`Testing with user: ${userWithPosts.name} (${userWithPosts._id})`);

    // Check if user has any posts
    const userPosts = await Post.find({ user: userWithPosts._id }).lean();
    console.log(`User has ${userPosts.length} posts:`);
    
    userPosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" - Status: ${post.status || 'published'} - Created: ${post.createdAt}`);
    });

    // Test the getMyPosts query logic
    console.log('\n--- Testing getMyPosts query logic ---');
    
    // Test 1: Get all posts
    const allPosts = await Post.find({ user: userWithPosts._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name username avatarUrl' })
      .lean();
    console.log(`All posts query returned: ${allPosts.length} posts`);

    // Test 2: Get only drafts
    const draftPosts = await Post.find({ 
      user: userWithPosts._id,
      status: 'draft'
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name username avatarUrl' })
      .lean();
    console.log(`Draft posts query returned: ${draftPosts.length} posts`);

    // Test 3: Get only published
    const publishedPosts = await Post.find({ 
      user: userWithPosts._id,
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name username avatarUrl' })
      .lean();
    console.log(`Published posts query returned: ${publishedPosts.length} posts`);

    // Test 4: Get posts without status (legacy)
    const legacyPosts = await Post.find({ 
      user: userWithPosts._id,
      status: { $exists: false }
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name username avatarUrl' })
      .lean();
    console.log(`Legacy posts (no status) query returned: ${legacyPosts.length} posts`);

    console.log('\n--- Test completed successfully ---');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testMyPosts();
