/**
 * Medicine Controller
 * Handles medicine CRUD operations
 */

const Medicine = require('../models/Medicine.model');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create medicine
 * POST /api/medicines
 */
const createMedicine = async (req, res) => {
  try {
    const { name, description, category, price, stock, manufacturer, expiryDate, pharmacyId } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return errorResponse(res, 'Name, category, and price are required', 400);
    }

    const medicine = await Medicine.create({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      manufacturer,
      expiryDate,
      pharmacyId
    });

    return successResponse(res, 'Medicine created successfully', { medicine }, 201);
  } catch (error) {
    console.error('Create medicine error:', error);
    return errorResponse(res, error.message || 'Failed to create medicine', 500);
  }
};

/**
 * Get all medicines
 * GET /api/medicines
 */
const getMedicines = async (req, res) => {
  try {
    const { category, pharmacyId, search } = req.query;
    const Inventory = require('../models/Inventory.model');
    const Pharmacy = require('../models/Pharmacy.model');
    
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let medicines = await Medicine.find(filter).lean();
    
    // For each medicine, get inventory and pharmacy info
    const medicinesWithAvailability = await Promise.all(medicines.map(async (medicine) => {
      // Get inventory items for this medicine
      let inventoryQuery = { medicineId: medicine._id };
      if (pharmacyId) inventoryQuery.pharmacyId = pharmacyId;
      
      const inventoryItems = await Inventory.find(inventoryQuery).lean();
      
      // Build availableAt array with pharmacy info
      // Check both Pharmacy collection and User collection for pharmacy details
      const availableAt = await Promise.all(inventoryItems.map(async (item) => {
        let pharmacyInfo = null;
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
        ...medicine,
        availableAt,
        stock: totalStock,
        price: availableAt.length > 0 ? availableAt[0].price : medicine.price
      };
    }));
    
    return successResponse(res, 'Medicines retrieved successfully', { medicines: medicinesWithAvailability });
  } catch (error) {
    console.error('Get medicines error:', error);
    return errorResponse(res, error.message || 'Failed to get medicines', 500);
  }
};

/**
 * Get medicine by ID
 * GET /api/medicines/:id
 */
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('pharmacyId', 'name email pharmacyName');
    
    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    return successResponse(res, 'Medicine retrieved successfully', { medicine });
  } catch (error) {
    console.error('Get medicine error:', error);
    return errorResponse(res, error.message || 'Failed to get medicine', 500);
  }
};

/**
 * Update medicine
 * PUT /api/medicines/:id
 */
const updateMedicine = async (req, res) => {
  try {
    const { name, description, category, price, stock, manufacturer, expiryDate, quantity } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (quantity !== undefined) updateData.stock = quantity; // Support both stock and quantity
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (expiryDate) updateData.expiryDate = expiryDate;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    return successResponse(res, 'Medicine updated successfully', { medicine });
  } catch (error) {
    console.error('Update medicine error:', error);
    return errorResponse(res, error.message || 'Failed to update medicine', 500);
  }
};

/**
 * Delete medicine
 * DELETE /api/medicines/:id
 */
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    
    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    return successResponse(res, 'Medicine deleted successfully');
  } catch (error) {
    console.error('Delete medicine error:', error);
    return errorResponse(res, error.message || 'Failed to delete medicine', 500);
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
};
