const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/posts', postRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Fallback route (for SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection
mongoose.connect('Here your own mongo url')
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
