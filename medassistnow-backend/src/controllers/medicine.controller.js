/*
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







































































































































};  deleteMedicine  updateMedicine,  getMedicineById,  getMedicines,  createMedicine,
nmodule.exports = {};  }    return errorResponse(res, error.message || 'Failed to delete medicine', 500);    console.error('Delete medicine error:', error);  } catch (error) {
n    return successResponse(res, 'Medicine deleted successfully');    }      return errorResponse(res, 'Medicine not found', 404);    if (!medicine) {        const medicine = await Medicine.findByIdAndDelete(req.params.id);  try {const deleteMedicine = async (req, res) => { */ * DELETE /api/medicines/:id * Delete medicine/**};  }    return errorResponse(res, error.message || 'Failed to update medicine', 500);    console.error('Update medicine error:', error);  } catch (error) {
n    return successResponse(res, 'Medicine updated successfully', { medicine });    }      return errorResponse(res, 'Medicine not found', 404);    if (!medicine) {    );      { new: true, runValidators: true }      updateData,      req.params.id,    const medicine = await Medicine.findByIdAndUpdate(    if (expiryDate) updateData.expiryDate = expiryDate;    if (manufacturer) updateData.manufacturer = manufacturer;    if (quantity !== undefined) updateData.stock = quantity; // Support both stock and quantity    if (stock !== undefined) updateData.stock = stock;    if (price !== undefined) updateData.price = price;    if (category) updateData.category = category;    if (description) updateData.description = description;    if (name) updateData.name = name;    const updateData = {};    // Build update object    const { name, description, category, price, stock, manufacturer, expiryDate, quantity } = req.body;  try {const updateMedicine = async (req, res) => { */ * PUT /api/medicines/:id * Update medicine/**};  }    return errorResponse(res, error.message || 'Failed to get medicine', 500);    console.error('Get medicine error:', error);  } catch (error) {
n    return successResponse(res, 'Medicine retrieved successfully', { medicine });    }      return errorResponse(res, 'Medicine not found', 404);    if (!medicine) {        const medicine = await Medicine.findById(req.params.id).populate('pharmacyId', 'name email pharmacyName');  try {const getMedicineById = async (req, res) => { */ * GET /api/medicines/:id * Get medicine by ID/**};  }    return errorResponse(res, error.message || 'Failed to get medicines', 500);    console.error('Get medicines error:', error);  } catch (error) {    return successResponse(res, 'Medicines retrieved successfully', { medicines: medicinesWithAvailability });        }));      };        price: availableAt.length > 0 ? availableAt[0].price : medicine.price        stock: totalStock,        availableAt,        ...medicine,      return {            const totalStock = availableAt.reduce((sum, item) => sum + item.stock, 0);      // Calculate total stock across all pharmacies            }));        };          location: pharmacyLocation          stock: item.quantity || 0,          price: item.price || medicine.price,          pharmacy: pharmacyName,          pharmacyId: item.pharmacyId,        return {                }          }            pharmacyLocation = pharmacyUser.address || '';            pharmacyName = pharmacyUser.pharmacyName || pharmacyUser.name;          if (pharmacyUser) {          const pharmacyUser = await User.findById(item.pharmacyId).lean();          // Fallback: Check User collection for pharmacy users        } else {          pharmacyLocation = pharmacy.location || pharmacy.address || '';          pharmacyName = pharmacy.pharmacyName || pharmacy.name;        if (pharmacy) {        const pharmacy = await Pharmacy.findById(item.pharmacyId).lean();        // First try to find in Pharmacy collection                let pharmacyLocation = '';        let pharmacyName = 'Unknown Pharmacy';        let pharmacyInfo = null;      const availableAt = await Promise.all(inventoryItems.map(async (item) => {      // Check both Pharmacy collection and User collection for pharmacy details      // Build availableAt array with pharmacy info            const inventoryItems = await Inventory.find(inventoryQuery).lean();            if (pharmacyId) inventoryQuery.pharmacyId = pharmacyId;      let inventoryQuery = { medicineId: medicine._id };      // Get inventory items for this medicine    const medicinesWithAvailability = await Promise.all(medicines.map(async (medicine) => {    // For each medicine, get inventory and pharmacy info    n    let medicines = await Medicine.find(filter).lean();