/**
 * Inventory Controller
 * Handle pharmacy inventory operations
 */

const Inventory = require('../models/Inventory.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Add inventory
 * POST /api/inventory
 */
const addInventory = async (req, res, next) => {
  try {
    const { pharmacyId, medicineId, quantity } = req.body;
    
    const inventory = new Inventory({
      pharmacyId,
      medicineId,
      quantity
    });
    
    await inventory.save();
    
    return successResponse(res, 'Inventory added successfully', { inventory }, 201);
  } catch (error) {
    console.error('❌ Error adding inventory:', error);
    next(error);
  }
};

/**
 * Get inventory by pharmacy
 * GET /api/inventory/pharmacy/:pharmacyId
 */
const getInventoryByPharmacy = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ pharmacyId: req.params.pharmacyId })
      .populate('medicineId')
      .populate('pharmacyId');
    
    return successResponse(res, 'Inventory retrieved successfully', { inventory });
  } catch (error) {
    console.error('❌ Error getting inventory:', error);
    next(error);
  }
};

/**
 * Update inventory
 * PUT /api/inventory/:id
 */
const updateInventory = async (req, res, next) => {
  try {
    const { quantity, stock, price, expiryDate } = req.body;
    
    // Build update object - support both quantity and stock field names
    const updateData = {
      updatedAt: Date.now()
    };
    
    if (quantity !== undefined) updateData.quantity = quantity;
    if (stock !== undefined) updateData.quantity = stock; // Map stock to quantity
    if (price !== undefined) updateData.price = price;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!inventory) {
      return errorResponse(res, 'Inventory not found', 404);
    }
    
    return successResponse(res, 'Inventory updated successfully', { inventory });
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    next(error);
  }
};

/**
 * Delete inventory
 * DELETE /api/inventory/:id
 */
const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!inventory) {
      return errorResponse(res, 'Inventory not found', 404);
    }
    
    return successResponse(res, 'Inventory deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting inventory:', error);
    next(error);
  }
};

/**
 * Update inventory by medicine ID
 * PUT /api/inventory/medicine/:medicineId
 */
const updateInventoryByMedicine = async (req, res, next) => {
  try {
    const { quantity, stock, price, expiryDate, pharmacyId } = req.body;
    
    // Build update object - support both quantity and stock field names
    const updateData = {
      updatedAt: Date.now()
    };
    
    if (quantity !== undefined) updateData.quantity = quantity;
    if (stock !== undefined) updateData.quantity = stock; // Map stock to quantity
    if (price !== undefined) updateData.price = price;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    
    // Find and update inventory by medicineId (and optionally pharmacyId)
    const query = { medicineId: req.params.medicineId };
    if (pharmacyId) query.pharmacyId = pharmacyId;
    
    const inventory = await Inventory.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!inventory) {
      return errorResponse(res, 'Inventory not found for this medicine', 404);
    }
    
    return successResponse(res, 'Inventory updated successfully', { inventory });
  } catch (error) {
    console.error('❌ Error updating inventory by medicine:', error);
    next(error);
  }
};

/**
 * Get all inventory items
 * GET /api/inventory
 */
const getAllInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find()
      .populate('medicineId')
      .populate('pharmacyId', 'name pharmacyName email');
    
    return successResponse(res, 'Inventory retrieved successfully', { inventory });
  } catch (error) {
    console.error('❌ Error getting all inventory:', error);
    next(error);
  }
};

module.exports = {
  addInventory,
  getInventoryByPharmacy,
  updateInventory,
  deleteInventory,
  updateInventoryByMedicine,
  getAllInventory
};
