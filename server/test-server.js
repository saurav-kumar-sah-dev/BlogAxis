// Simple test server to debug Render deployment
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'BlogAxis API is running!', 
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGO_URI ? 'Set' : 'Not Set'}`);
});

// Handle process exit
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
