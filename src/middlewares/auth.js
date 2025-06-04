const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Middleware to check if the request is from an admin
 * For simplicity, we're using a basic authentication approach
 * In a production environment, you would use JWT or another robust auth mechanism
 */
const isAdmin = (req, res, next) => {
  // Get admin password from request headers
  const adminPassword = req.headers['admin-password'];

  // Check if password matches
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin access required'
    });
  }

  // If password matches, proceed
  next();
};

module.exports = { isAdmin }; 