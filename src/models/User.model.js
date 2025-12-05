/**
 * User Model
 * MongoDB schema for user authentication
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  landmark: { type: String, trim: true }
}, { _id: false });

const operatingHoursSchema = new mongoose.Schema({
  monday: { type: String, trim: true, default: '9:00 AM - 9:00 PM' },
  tuesday: { type: String, trim: true, default: '9:00 AM - 9:00 PM' },
  wednesday: { type: String, trim: true, default: '9:00 AM - 9:00 PM' },
  thursday: { type: String, trim: true, default: '9:00 AM - 9:00 PM' },
  friday: { type: String, trim: true, default: '9:00 AM - 9:00 PM' },
  saturday: { type: String, trim: true, default: '9:00 AM - 6:00 PM' },
  sunday: { type: String, trim: true, default: 'Closed' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'pharmacy', 'delivery', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: addressSchema
  },
  // Delivery partner specific fields
  vehicleType: { type: String, trim: true },
  vehicleNumber: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  licenseExpiry: { type: Date },
  // Pharmacy specific fields
  pharmacyName: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  operatingHours: { type: operatingHoursSchema },
  // Bank details
  bankDetails: {
    accountName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    bankName: { type: String, trim: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
