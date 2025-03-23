
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create media directories if they don't exist
const mediaPath = path.join(__dirname, '..', process.env.MEDIA_PATH || 'media');
const thumbsPath = path.join(mediaPath, 'thumbs');

const fs = require('fs');
if (!fs.existsSync(mediaPath)) {
  fs.mkdirSync(mediaPath, { recursive: true });
  console.log(`Created media directory: ${mediaPath}`);
}
if (!fs.existsSync(thumbsPath)) {
  fs.mkdirSync(thumbsPath, { recursive: true });
  console.log(`Created thumbs directory: ${thumbsPath}`);
}

// Serve static files from media folder
app.use('/media', express.static(mediaPath));
app.use('/media/thumbs', express.static(thumbsPath));

// API routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
