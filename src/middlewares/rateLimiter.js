const rateLimit = require('express-rate-limit');

/**
 * Creates a custom Redis store for rate limiting
 * @param {Object} redisClient - Redis client instance
 * @returns {Object} Custom Redis store for rate limiting
 */
const createRedisStore = (redisClient) => {
  return {
    // Method to increment and check rate limit
    async increment(key) {
      const redisKey = `rate-limit:${key}`;
      let result;
      
      try {
        // Use Redis pipeline for atomic operations
        const pipeline = redisClient.pipeline();
        
        // Increment the counter
        pipeline.incr(redisKey);
        
        // Set expiration if it doesn't exist
        pipeline.expire(redisKey, 60); // 60 seconds expiry
        
        // Execute pipeline
        const replies = await pipeline.exec();
        
        // Get the counter value from the first command (INCR)
        const counter = replies[0][1];
        
        result = {
          totalHits: counter,
          resetTime: Date.now() + (60 * 1000) // 60 seconds from now
        };
      } catch (err) {
        console.error('Redis rate limit error:', err);
        // Fallback to allow the request if Redis fails
        result = {
          totalHits: 1,
          resetTime: Date.now() + (60 * 1000)
        };
      }
      
      return result;
    },
    
    // Reset the counter for a key
    async reset(key) {
      try {
        await redisClient.del(`rate-limit:${key}`);
      } catch (err) {
        console.error('Redis rate limit reset error:', err);
      }
    }
  };
};

/**
 * Creates a Redis-based rate limiter middleware
 * @param {Object} redisClient - Redis client instance
 * @returns {Function} Express middleware function
 */
const createRateLimiterRedis = (redisClient) => {
  // If Redis client is not available, use memory store
  if (!redisClient) {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 requests per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests, please try again later.'
      }
    });
  }
  
  // Use Redis for rate limiting
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    store: createRedisStore(redisClient)
  });
};

/**
 * Simple IP-based rate limiter middleware using Redis
 * Limits to 30 requests per minute per IP address
 * 
 * @param {Object} redisClient - Redis client instance
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (redisClient) => {
  return async (req, res, next) => {
    // If Redis is not available, allow all requests
    if (!redisClient) {
      return next();
    }

    try {
      // Get client IP address
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `ratelimit:${ip}`;
      
      // Get current count for this IP
      const currentCount = await redisClient.incr(key);
      
      // Set expiry (60 seconds) if this is the first request in the window
      if (currentCount === 1) {
        await redisClient.expire(key, 60);
      }
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', 30);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, 30 - currentCount));
      
      // If over limit, send 429 Too Many Requests
      if (currentCount > 30) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.'
        });
      }
      
      // Continue to the next middleware
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If there's an error, allow the request
      next();
    }
  };
};

module.exports = { createRateLimiter }; 