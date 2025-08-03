const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    // Skip Redis in development if not required
    if (process.env.NODE_ENV === 'development' && process.env.REDIS_REQUIRED !== 'true') {
      logger.warn('⚠️ Redis skipped in development mode');
      return null;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB) || 0,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('📡 Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis connection closed');
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not available, skipping cache operation');
    return null;
  }
  return redisClient;
};

// Cache helper functions
const cache = {
  async get(key) {
    try {
      const client = getRedisClient();
      if (!client) return null;
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key, value, expireInSeconds = 3600) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  async exists(key) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      return await client.exists(key) === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async flushPattern(pattern) {
    try {
      const client = getRedisClient();
      if (!client) return false;
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis FLUSH PATTERN error:', error);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cache
};
