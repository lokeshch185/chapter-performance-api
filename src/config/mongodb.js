const mongoose = require('mongoose');

/**
 * Configure MongoDB connection
 * @returns {Promise} MongoDB connection promise
 */
const configureMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mathango');
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = {
  mongoose,
  configureMongoDB
};
