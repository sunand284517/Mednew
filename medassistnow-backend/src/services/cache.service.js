/**
 * Cache Service
 * Reusable Redis caching helper functions
 */

const { redisClient } = require('../config/redis');

/**
 * Set cache with automatic JSON stringification
 * @param {String} key - Cache key
 * @param {Any} value - Value to cache (will be JSON stringified)
 * @param {Number} ttlInSeconds - Time to live in seconds (optional)
 */
const setCache = async (key, value, ttlInSeconds = 3600) => {
  try {
    // Convert value to JSON string
    const jsonValue = JSON.stringify(value);
    
    // Set with TTL (expiration)
    if (ttlInSeconds) {
      await redisClient.setEx(key, ttlInSeconds, jsonValue);
    } else {
      await redisClient.set(key, jsonValue);
    }
    
    console.log(`✅ Cache SET: ${key} (TTL: ${ttlInSeconds}s)`);
    return true;
  } catch (error) {
    console.error(`❌ Cache SET error for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Get cache with automatic JSON parsing
 * @param {String} key - Cache key
 * @returns {Any|null} - Parsed value or null if not found
 */
const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    
    // Handle missing key gracefully
    if (value === null) {
      console.log(`⚠️  Cache MISS: ${key}`);
      return null;
    }
    
    // Parse JSON string back to object
    const parsedValue = JSON.parse(value);
    console.log(`✅ Cache HIT: ${key}`);
    return parsedValue;
  } catch (error) {
    console.error(`❌ Cache GET error for key "${key}":`, error.message);
    return null;
  }
};

/**
 * Delete cache key
 * @param {String} key - Cache key to delete
 * @returns {Boolean} - True if deleted, false otherwise
 */
const deleteCache = async (key) => {
  try {
    const result = await redisClient.del(key);
    
    if (result === 1) {
      console.log(`✅ Cache DELETED: ${key}`);
      return true;
    } else {
      console.log(`⚠️  Cache key not found: ${key}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Cache DELETE error for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Check if key exists in cache
 * @param {String} key - Cache key
 * @returns {Boolean} - True if exists, false otherwise
 */
const existsCache = async (key) => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`❌ Cache EXISTS error for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Get remaining TTL for a key
 * @param {String} key - Cache key
 * @returns {Number} - TTL in seconds, -1 if no expiration, -2 if key doesn't exist
 */
const getTTL = async (key) => {
  try {
    const ttl = await redisClient.ttl(key);
    return ttl;
  } catch (error) {
    console.error(`❌ Cache TTL error for key "${key}":`, error.message);
    return -2;
  }
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  existsCache,
  getTTL
};
