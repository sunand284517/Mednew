/**
 * Inventory Routes
 * Handle inventory-related endpoints
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// GET /api/inventory - Get all inventory
router.get('/', inventoryController.getAllInventory);

// POST /api/inventory - Add inventory
router.post('/', inventoryController.addInventory);

// GET /api/inventory/pharmacy/:pharmacyId - Get inventory by pharmacy
router.get('/pharmacy/:pharmacyId', inventoryController.getInventoryByPharmacy);

// PUT /api/inventory/medicine/:medicineId - Update inventory by medicine ID
router.put('/medicine/:medicineId', inventoryController.updateInventoryByMedicine);

// PUT /api/inventory/:id - Update inventory
router.put('/:id', inventoryController.updateInventory);

// DELETE /api/inventory/:id - Delete inventory
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;
