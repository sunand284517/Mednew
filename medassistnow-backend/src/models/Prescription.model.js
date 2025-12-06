/**
 * Prescription Model
 * MongoDB schema for prescription uploads
 */

const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imageData: {
    type: String, // Base64 encoded image
    required: false
  },
  extractedText: {
    type: String,
    default: ''
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  doctorName: {
    type: String,
    trim: true
  },
  patientName: {
    type: String,
    trim: true
  },
  prescriptionDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'fulfilled', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
