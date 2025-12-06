/**
 * Prescription Routes
 * Handle prescription-related endpoints
 */

const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');

// POST /api/prescriptions/upload - Upload prescription with OCR
router.post('/upload', prescriptionController.uploadPrescription);

// GET /api/prescriptions/user/:userId - Get user prescriptions
router.get('/user/:userId', prescriptionController.getUserPrescriptions);

// GET /api/prescriptions/:id - Get prescription by ID
router.get('/:id', prescriptionController.getPrescriptionById);

// PUT /api/prescriptions/:id/status - Update prescription status
router.put('/:id/status', prescriptionController.updatePrescriptionStatus);

// DELETE /api/prescriptions/:id - Delete prescription
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
