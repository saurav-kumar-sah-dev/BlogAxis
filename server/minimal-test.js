// Minimal test to debug Render deployment
console.log('🚀 Starting minimal test server...');
console.log('📊 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || 'not set');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'set' : 'not set');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Minimal test server is working!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Keep the process alive
setInterval(() => {
  console.log('💓 Heartbeat - server is alive');
}, 30000);
