/**
 * Redis cache middleware
 * Caches API responses and serves from cache when available
 */

// Cache key for chapters
const CHAPTERS_CACHE_KEY = 'api:chapters';

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in seconds
 */
const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = req.app.locals.redisClient;
    if (!redisClient) {
      // Skip caching if Redis is not available
      return next();
    }

    try {
      // Generate a unique cache key based on the request URL and query params
      const cacheKey = `${CHAPTERS_CACHE_KEY}:${req.originalUrl}`;
      
      // Try to get data from cache
      const cachedData = await redisClient.get(cacheKey).catch(err => {
        console.error('Redis cache get error:', err);
        return null; // Return null if Redis operation fails
      });
      
      if (cachedData) {
        try {
          // If cache exists, send the cached response
          const data = JSON.parse(cachedData);
          return res.status(200).json({
            success: true,
            fromCache: true,
            ...data
          });
        } catch (parseError) {
          console.error('Cache data parse error:', parseError);
          // Continue without cache if parsing fails
        }
      }

      // If no cache, modify res.json to cache the response before sending
      const originalJson = res.json;
      res.json = function(data) {
        // Don't cache error responses
        if (res.statusCode >= 400) {
          return originalJson.call(this, data);
        }
        
        // Cache the response
        redisClient.setex(
          cacheKey,
          duration,
          JSON.stringify(data)
        ).catch(err => console.error('Redis cache set error:', err));
        
        // Call the original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching if there's an error
      next();
    }
  };
};

/**
 * Invalidate chapters cache
 * @param {Object} redisClient - Redis client instance
 */
const invalidateChaptersCache = async (redisClient) => {
  if (!redisClient) {
    console.warn('Cache invalidation skipped: Redis not available');
    return;
  }
  
  try {
    // Get all keys matching the chapters cache pattern
    const keys = await redisClient.keys(`${CHAPTERS_CACHE_KEY}:*`).catch(err => {
      console.error('Redis keys error:', err);
      return [];
    });
    
    if (keys.length > 0) {
      // Delete all matching keys
      await Promise.all(keys.map(key => 
        redisClient.del(key).catch(err => {
          console.error(`Redis del error for key ${key}:`, err);
        })
      ));
      console.log(`Invalidated ${keys.length} cache entries`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

module.exports = {
  cacheMiddleware,
  invalidateChaptersCache
}; 