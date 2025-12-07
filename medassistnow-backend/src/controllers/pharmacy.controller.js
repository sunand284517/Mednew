/**
 * Pharmacy Controller
 * Handle pharmacy CRUD operations
 */

const Pharmacy = require('../models/Pharmacy.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create pharmacy
 * POST /api/pharmacies
 */
const createPharmacy = async (req, res, next) => {
  try {
    const { name, ownerName, email, phone, address, location } = req.body;
    
    const pharmacy = new Pharmacy({
      name,
      ownerName,
      email,
      phone,
      address,
      location
    });
    
    await pharmacy.save();
    
    return successResponse(res, 'Pharmacy created successfully', { pharmacy }, 201);
  } catch (error) {
    console.error('❌ Error creating pharmacy:', error);
    next(error);
  }
};

/**
 * Get all pharmacies
 * GET /api/pharmacies
 */
const getPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find();
    return successResponse(res, 'Pharmacies retrieved successfully', { pharmacies });
  } catch (error) {
    console.error('❌ Error getting pharmacies:', error);
    next(error);
  }
};

/**
 * Get pharmacy by ID
 * GET /api/pharmacies/:id
 */
const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    
    if (!pharmacy) {
      return errorResponse(res, 'Pharmacy not found', 404);
    }
    
    return successResponse(res, 'Pharmacy retrieved successfully', { pharmacy });
  } catch (error) {
    console.error('❌ Error getting pharmacy:', error);
    next(error);
  }
};

/**
 * Update pharmacy
 * PUT /api/pharmacies/:id
 */
const updatePharmacy = async (req, res, next) => {
  try {
    const { name, ownerName, email, phone, address, location, isApproved } = req.body;
    
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { name, ownerName, email, phone, address, location, isApproved },
      { new: true, runValidators: true }
    );
    
    if (!pharmacy) {
      return errorResponse(res, 'Pharmacy not found', 404);
    }
    
    return successResponse(res, 'Pharmacy updated successfully', { pharmacy });
  } catch (error) {
    console.error('❌ Error updating pharmacy:', error);
    next(error);
  }
};

/**
 * Delete pharmacy
 * DELETE /api/pharmacies/:id
 */
const deletePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    
    if (!pharmacy) {
      return errorResponse(res, 'Pharmacy not found', 404);
    }
    
    return successResponse(res, 'Pharmacy deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting pharmacy:', error);
    next(error);
  }
};

module.exports = {
  createPharmacy,
  getPharmacies,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy
};
