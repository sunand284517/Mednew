/**
 * Redis Configuration
 * Redis connection setup for caching
 */

const { createClient } = require('redis');
const { REDIS_HOST, REDIS_PORT } = require('./environment');

// Create Redis client
const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
});

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis Connected:', `${REDIS_HOST}:${REDIS_PORT}`);
    
    // Connection event listeners
    redisClient.on('connect', () => {
      console.log('📡 Redis client connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    throw error;
  }
};

/**
 * Disconnect from Redis
 */
const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('✅ Redis disconnected successfully');
  } catch (error) {
    console.error('❌ Redis disconnect error:', error.message);
    throw error;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis
};
