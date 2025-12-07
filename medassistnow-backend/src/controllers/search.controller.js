/**
 * Search Controller
 * Handle search requests using Elasticsearch
 */

const { searchDocuments } = require('../services/search.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const Medicine = require('../models/Medicine.model');
const Inventory = require('../models/Inventory.model');

/**
 * Search medicines by keyword
 * GET /api/search/medicines?q=keyword
 */
const searchMedicines = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    // Validate query parameter
    if (!q || q.trim() === '') {
      return errorResponse(res, 'Search keyword is required (use ?q=keyword)', 400);
    }
    
    // Search in Elasticsearch for matching medicines
    const esResults = await searchDocuments('medicines', q);
    
    // If no ES results, try MongoDB fallback search
    if (esResults.length === 0) {
      const mongoResults = await Medicine.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      }).lean();
      
      // Get fresh inventory data for MongoDB results
      const resultsWithInventory = await enrichMedicinesWithInventory(mongoResults);
      
      return successResponse(res, `Found ${resultsWithInventory.length} results for "${q}"`, {
        query: q,
        count: resultsWithInventory.length,
        results: resultsWithInventory
      });
    }
    
    // Get medicine IDs from ES results and fetch fresh data from MongoDB
    const medicineNames = esResults.map(r => r.name).filter(Boolean);
    
    // Find medicines in MongoDB by name (ES might have stale _id)
    const freshMedicines = await Medicine.find({
      name: { $in: medicineNames }
    }).lean();
    
    // Merge ES search relevance with fresh MongoDB data
    const resultsWithInventory = await enrichMedicinesWithInventory(freshMedicines);
    
    // Return results with fresh stock data
    return successResponse(res, `Found ${resultsWithInventory.length} results for "${q}"`, {
      query: q,
      count: resultsWithInventory.length,
      results: resultsWithInventory
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return errorResponse(res, 'Search failed: ' + error.message, 500);
  }
};

/**
 * Enrich medicines with fresh inventory data
 */
async function enrichMedicinesWithInventory(medicines) {
  const Pharmacy = require('../models/Pharmacy.model');
  const User = require('../models/User.model');
  
  return Promise.all(medicines.map(async (medicine) => {
    // Get inventory items for this medicine
    const inventoryItems = await Inventory.find({ medicineId: medicine._id }).lean();
    
    // Build availableAt array with pharmacy info - check both Pharmacy and User collections
    const availableAt = await Promise.all(inventoryItems.map(async (item) => {
      let pharmacyName = 'Unknown Pharmacy';
      let pharmacyLocation = '';
      
      // First try to find in Pharmacy collection
      const pharmacy = await Pharmacy.findById(item.pharmacyId).lean();
      if (pharmacy) {
        pharmacyName = pharmacy.pharmacyName || pharmacy.name;
        pharmacyLocation = pharmacy.location || pharmacy.address || '';
      } else {
        // Fallback: Check User collection for pharmacy users
        const pharmacyUser = await User.findById(item.pharmacyId).lean();
        if (pharmacyUser) {
          pharmacyName = pharmacyUser.pharmacyName || pharmacyUser.name;
          pharmacyLocation = pharmacyUser.address || '';
        }
      }
      
      return {
        pharmacyId: item.pharmacyId,
        pharmacy: pharmacyName,
        price: item.price || medicine.price,
        stock: item.quantity || 0,
        location: pharmacyLocation
      };
    }));
    
    // Calculate total stock across all pharmacies
    const totalStock = availableAt.reduce((sum, item) => sum + item.stock, 0);
    
    return {
      _id: medicine._id,
      id: medicine._id,
      name: medicine.name,
      description: medicine.description,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      availableAt,
      stock: totalStock,
      price: availableAt.length > 0 ? availableAt[0].price : medicine.price
    };
  }));
}

module.exports = {
  searchMedicines
};
