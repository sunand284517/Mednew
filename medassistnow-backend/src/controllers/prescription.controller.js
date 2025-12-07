/**
 * Prescription Controller
 * Handles prescription upload and OCR processing
 */

const Prescription = require('../models/Prescription.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { extractTextFromImage } = require('../services/ocr.service');

/**
 * Upload prescription with OCR
 * POST /api/prescriptions/upload
 */
const uploadPrescription = async (req, res) => {
  try {
    console.log('📸 Prescription upload started...');
    const { userId, imageData, doctorName, patientName, prescriptionDate, notes } = req.body;

    if (!userId || !imageData) {
      console.log('❌ Missing userId or imageData');
      return errorResponse(res, 'User ID and image data are required', 400);
    }

    console.log('✅ User ID and image data received');

    // Extract text using OCR
    let extractedText = '';
    let medicines = [];
    
    try {
      console.log('🔍 Starting OCR processing...');
      extractedText = await extractTextFromImage(imageData);
      console.log('✅ OCR completed. Extracted text length:', extractedText.length);
      
      // Parse extracted text for medicines (simple pattern matching)
      medicines = parseMedicinesFromText(extractedText);
      console.log('💊 Parsed medicines:', medicines.length);
      
    } catch (ocrError) {
      console.error('❌ OCR processing error:', ocrError);
      // Continue without OCR if it fails
    }

    // Create prescription record (store only image reference, not full data to avoid MongoDB size limits)
    console.log('💾 Saving prescription to database...');
    const prescription = await Prescription.create({
      userId,
      imageUrl: 'data:image/jpeg;base64,' + imageData.substring(0, 100), // Store small preview
      imageData: imageData.substring(0, 5000), // Store only first 5KB as preview
      extractedText,
      medicines,
      doctorName,
      patientName,
      prescriptionDate: prescriptionDate || new Date(),
      notes,
      status: 'processed'
    });

    console.log('✅ Prescription saved with ID:', prescription._id);

    return successResponse(res, 'Prescription uploaded successfully', { 
      prescription: {
        _id: prescription._id,
        extractedText: prescription.extractedText,
        medicines: prescription.medicines,
        status: prescription.status,
        createdAt: prescription.createdAt
      }
    }, 201);

  } catch (error) {
    console.error('Upload prescription error:', error);
    return errorResponse(res, error.message || 'Failed to upload prescription', 500);
  }
};

/**
 * Get user prescriptions
 * GET /api/prescriptions/user/:userId
 */
const getUserPrescriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    const prescriptions = await Prescription.find({ userId })
      .sort({ createdAt: -1 })
      .select('-imageData'); // Don't send full image data in list

    return successResponse(res, 'Prescriptions retrieved successfully', { prescriptions });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    return errorResponse(res, error.message || 'Failed to get prescriptions', 500);
  }
};

/**
 * Get prescription by ID
 * GET /api/prescriptions/:id
 */
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    return successResponse(res, 'Prescription retrieved successfully', { prescription });

  } catch (error) {
    console.error('Get prescription error:', error);
    return errorResponse(res, error.message || 'Failed to get prescription', 500);
  }
};

/**
 * Update prescription status
 * PUT /api/prescriptions/:id/status
 */
const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processed', 'fulfilled', 'rejected'].includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    return successResponse(res, 'Prescription status updated successfully', { prescription });

  } catch (error) {
    console.error('Update prescription error:', error);
    return errorResponse(res, error.message || 'Failed to update prescription', 500);
  }
};

/**
 * Delete prescription
 * DELETE /api/prescriptions/:id
 */
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    return successResponse(res, 'Prescription deleted successfully');

  } catch (error) {
    console.error('Delete prescription error:', error);
    return errorResponse(res, error.message || 'Failed to delete prescription', 500);
  }
};

/**
 * Helper function to parse medicines from extracted text
 */
function parseMedicinesFromText(text) {
  const medicines = [];
  const lines = text.split('\n');
  
  // Common medicine patterns
  const medicinePattern = /([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+\s*mg|\d+\s*mcg|\d+\s*ml)?/i;
  const dosagePattern = /(\d+\s*times?\s*(?:a|per)\s*day|\d+x\d+|\d+-\d+-\d+)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and common non-medicine text
    if (!line || line.length < 3) continue;
    if (/^(Dr\.|patient|date|prescription)/i.test(line)) continue;
    
    const medicineMatch = line.match(medicinePattern);
    const dosageMatch = line.match(dosagePattern);
    
    if (medicineMatch && medicineMatch[1].length > 3) {
      medicines.push({
        name: medicineMatch[1].trim(),
        dosage: medicineMatch[2] ? medicineMatch[2].trim() : '',
        frequency: dosageMatch ? dosageMatch[1].trim() : ''
      });
    }
  }
  
  return medicines;
}

module.exports = {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
  deletePrescription
};
