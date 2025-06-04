const Redis = require('ioredis');
const { createRateLimiter } = require('../middlewares/rateLimiter');

/**
 * Configure Redis client and return both the client and middleware
 * @param {Object} app - Express app instance
 * @returns {Object} Redis client instance
 */
const configureRedis = (app) => {
  // Initialize Redis client with Redis Cloud configuration
  let redisClient;
  try {
    // Use Redis Cloud URL if provided, otherwise fallback to local Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      connectTimeout: 10000, // 10 seconds
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('connect', () => console.log('Redis Cloud connected'));
    redisClient.on('error', (err) => console.error('Redis Cloud error:', err));
    redisClient.on('reconnecting', () => console.log('Redis Cloud reconnecting...'));
    
    // Test connection
    redisClient.ping().then(() => {
      console.log('Redis Cloud connection verified (PING successful)');
    }).catch(err => {
      console.error('Redis Cloud PING failed:', err);
    });
    
  } catch (error) {
    console.error('Failed to initialize Redis Cloud client:', error);
    // Continue without Redis if it fails to initialize
    redisClient = null;
  }

  // Make Redis client available globally if connected
  if (redisClient) {
    app.locals.redisClient = redisClient;
  } else {
    console.warn('Warning: Running without Redis. Caching and rate limiting disabled.');
  }
  
  // Apply simple rate limiter middleware (30 requests per minute per IP)
  app.use(createRateLimiter(redisClient));

  return redisClient;
};

module.exports = configureRedis;
