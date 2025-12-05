/**
 * Pharmacy Routes
 * Handle pharmacy-related endpoints
 */

const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');

// POST /api/pharmacies - Create pharmacy
router.post('/', pharmacyController.createPharmacy);

// GET /api/pharmacies - Get all pharmacies
router.get('/', pharmacyController.getPharmacies);

// GET /api/pharmacies/:id - Get pharmacy by ID
router.get('/:id', pharmacyController.getPharmacyById);

// PUT /api/pharmacies/:id - Update pharmacy
router.put('/:id', pharmacyController.updatePharmacy);

// DELETE /api/pharmacies/:id - Delete pharmacy
router.delete('/:id', pharmacyController.deletePharmacy);

module.exports = router;
