/*
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










































































































































































};  deletePrescription  updatePrescriptionStatus,  getPrescriptionById,  getUserPrescriptions,  uploadPrescription,
nmodule.exports = {}  return medicines;    }    }      });        frequency: dosageMatch ? dosageMatch[1].trim() : ''        dosage: medicineMatch[2] ? medicineMatch[2].trim() : '',        name: medicineMatch[1].trim(),      medicines.push({    if (medicineMatch && medicineMatch[1].length > 3) {        const dosageMatch = line.match(dosagePattern);    const medicineMatch = line.match(medicinePattern);        if (/^(Dr\.|patient|date|prescription)/i.test(line)) continue;    if (!line || line.length < 3) continue;    // Skip empty lines and common non-medicine text        const line = lines[i].trim();  for (let i = 0; i < lines.length; i++) {    const dosagePattern = /(\d+\s*times?\s*(?:a|per)\s*day|\d+x\d+|\d+-\d+-\d+)/i;  const medicinePattern = /([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+\s*mg|\d+\s*mcg|\d+\s*ml)?/i;  // Common medicine patterns    const lines = text.split('\n');  const medicines = [];function parseMedicinesFromText(text) { */ * Helper function to parse medicines from extracted text/**};  }    return errorResponse(res, error.message || 'Failed to delete prescription', 500);    console.error('Delete prescription error:', error);  } catch (error) {
n    return successResponse(res, 'Prescription deleted successfully');    }      return errorResponse(res, 'Prescription not found', 404);
n    if (!prescription) {    const prescription = await Prescription.findByIdAndDelete(req.params.id);  try {const deletePrescription = async (req, res) => { */ * DELETE /api/prescriptions/:id * Delete prescription/**};  }    return errorResponse(res, error.message || 'Failed to update prescription', 500);    console.error('Update prescription error:', error);
n  } catch (error) {
n    return successResponse(res, 'Prescription status updated successfully', { prescription });    }      return errorResponse(res, 'Prescription not found', 404);
n    if (!prescription) {    );      { new: true }      { status },      req.params.id,
n    const prescription = await Prescription.findByIdAndUpdate(    }      return errorResponse(res, 'Invalid status', 400);
n    if (!['pending', 'processed', 'fulfilled', 'rejected'].includes(status)) {    const { status } = req.body;  try {const updatePrescriptionStatus = async (req, res) => { */ * PUT /api/prescriptions/:id/status * Update prescription status/**};  }    return errorResponse(res, error.message || 'Failed to get prescription', 500);    console.error('Get prescription error:', error);
n  } catch (error) {
n    return successResponse(res, 'Prescription retrieved successfully', { prescription });    }      return errorResponse(res, 'Prescription not found', 404);
n    if (!prescription) {      .populate('userId', 'name email phone');    const prescription = await Prescription.findById(req.params.id)  try {const getPrescriptionById = async (req, res) => { */ * GET /api/prescriptions/:id * Get prescription by ID/**};  }    return errorResponse(res, error.message || 'Failed to get prescriptions', 500);    console.error('Get prescriptions error:', error);
n  } catch (error) {
n    return successResponse(res, 'Prescriptions retrieved successfully', { prescriptions });      .select('-imageData'); // Don't send full image data in list      .sort({ createdAt: -1 })
n    const prescriptions = await Prescription.find({ userId })    const { userId } = req.params;  try {const getUserPrescriptions = async (req, res) => { */ * GET /api/prescriptions/user/:userId * Get user prescriptions/**};  }    return errorResponse(res, error.message || 'Failed to upload prescription', 500);    console.error('Upload prescription error:', error);
n  } catch (error) {    }, 201);      }        createdAt: prescription.createdAt        status: prescription.status,        medicines: prescription.medicines,        extractedText: prescription.extractedText,        _id: prescription._id,      prescription: {
n    return successResponse(res, 'Prescription uploaded successfully', { 
n    console.log('✅ Prescription saved with ID:', prescription._id);    });      status: 'processed'      notes,      prescriptionDate: prescriptionDate || new Date(),      patientName,      doctorName,      medicines,      extractedText,      imageData: imageData.substring(0, 5000), // Store only first 5KB as preview      imageUrl: 'data:image/jpeg;base64,' + imageData.substring(0, 100), // Store small preview      userId,    const prescription = await Prescription.create({    console.log('💾 Saving prescription to database...');
n    // Create prescription record (store only image reference, not full data to avoid MongoDB size limits)    }      // Continue without OCR if it fails      console.error('❌ OCR processing error:', ocrError);    } catch (ocrError) {            console.log('💊 Parsed medicines:', medicines.length);      medicines = parseMedicinesFromText(extractedText);      // Parse extracted text for medicines (simple pattern matching)            console.log('✅ OCR completed. Extracted text length:', extractedText.length);      extractedText = await extractTextFromImage(imageData);      console.log('🔍 Starting OCR processing...');    try {        let medicines = [];    let extractedText = '';    // Extract text using OCR
n    console.log('✅ User ID and image data received');    }      return errorResponse(res, 'User ID and image data are required', 400);      console.log('❌ Missing userId or imageData');n    if (!userId || !imageData) {