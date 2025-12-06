/**
 * Medicine Routes
 * Handle medicine-related endpoints
 */

const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');

// POST /api/medicines - Create medicine
router.post('/', medicineController.createMedicine);

// GET /api/medicines - Get all medicines
router.get('/', medicineController.getMedicines);

// GET /api/medicines/:id - Get medicine by ID
router.get('/:id', medicineController.getMedicineById);

// PUT /api/medicines/:id - Update medicine
router.put('/:id', medicineController.updateMedicine);

// DELETE /api/medicines/:id - Delete medicine
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router;
