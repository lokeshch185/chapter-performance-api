const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createRateLimiterRedis } = require('./middlewares/rateLimiter');
const chapterRoutes = require('./routes/chapterRoutes');
const { configureMongoDB } = require('./config/mongodb');
const configureRedis = require('./config/redis');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize MongoDB and Redis
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await configureMongoDB();
    
    // Configure Redis with the app instance
    configureRedis(app);
    
    // Routes
    app.use('/api/v1/chapters', chapterRoutes);
    
    // Serve the HTML UI
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    });
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`UI available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Start the application
initializeServices();

module.exports = app;