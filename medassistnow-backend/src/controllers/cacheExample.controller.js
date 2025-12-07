/**
 * Cache Example Controller
 * Demonstrates Redis caching with a simple example
 */

const { getCache, setCache } = require('../services/cache.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Example endpoint demonstrating Redis caching
 * GET /api/cache/example
 */
const example = async (req, res, next) => {
  try {
    const cacheKey = 'sample:data';
    
    // Step 1: Try to get data from Redis cache
    const cachedData = await getCache(cacheKey);
    
    // Step 2: If cache hit, return cached data
    if (cachedData) {
      return successResponse(res, 'Data retrieved from cache', {
        source: 'cache',
        data: cachedData,
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 3: If cache miss, create mock data
    console.log('🔄 Cache miss - generating new data...');
    
    const mockData = {
      medicines: [
        {
          id: 1,
          name: 'Paracetamol',
          price: 50,
          category: 'Pain Relief',
          inStock: true
        },
        {
          id: 2,
          name: 'Amoxicillin',
          price: 120,
          category: 'Antibiotic',
          inStock: true
        },
        {
          id: 3,
          name: 'Vitamin D3',
          price: 200,
          category: 'Supplement',
          inStock: false
        }
      ],
      pharmacies: [
        {
          id: 1,
          name: 'Apollo Pharmacy',
          location: 'Mumbai',
          rating: 4.5
        },
        {
          id: 2,
          name: 'MedPlus',
          location: 'Delhi',
          rating: 4.3
        }
      ],
      generatedAt: new Date().toISOString()
    };
    
    // Step 4: Store data in Redis with 60 seconds TTL
    const ttl = 60; // 60 seconds
    await setCache(cacheKey, mockData, ttl);
    
    // Step 5: Return the newly created data
    return successResponse(res, 'Data generated and cached successfully', {
      source: 'database',
      data: mockData,
      cachedFor: `${ttl} seconds`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Cache example error:', error);
    next(error);
  }
};

module.exports = {
  example
};
