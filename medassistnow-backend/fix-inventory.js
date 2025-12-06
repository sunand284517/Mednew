/**
 * Script to update inventory records to use the correct pharmacy ID
 * Run this once to fix existing data
 */

const mongoose = require('mongoose');
const { connectDB } = require('./src/config/database');

async function updateInventory() {
  try {
    await connectDB();
    
    const User = require('./src/models/User.model');
    const Inventory = require('./src/models/Inventory.model');
    
    // Find MediAgency pharmacy user
    const mediAgency = await User.findOne({ role: 'pharmacy' }).sort({ createdAt: -1 }).lean();
    
    if (!mediAgency) {
      console.log('No pharmacy user found');
      process.exit(1);
    }
    
    console.log('Found pharmacy user:', mediAgency._id.toString(), '-', mediAgency.pharmacyName || mediAgency.name);
    
    // Update all inventory records to use this pharmacy's ID
    const result = await Inventory.updateMany({}, { pharmacyId: mediAgency._id });
    console.log('Updated', result.modifiedCount, 'inventory records');
    
    // Verify
    const sample = await Inventory.findOne().lean();
    console.log('Sample inventory pharmacyId:', sample?.pharmacyId?.toString());
    
    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateInventory();
