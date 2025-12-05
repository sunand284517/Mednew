/**
 * Seed Sample Medicines
 * Run this to add test medicines to database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Medicine = require('./src/models/Medicine.model');
const Pharmacy = require('./src/models/Pharmacy.model');
const Inventory = require('./src/models/Inventory.model');

// Read medicines from JSON file
const medicinesFilePath = path.join(__dirname, 'data', 'medicines.json');
let sampleMedicines = [];

try {
  const medicinesData = fs.readFileSync(medicinesFilePath, 'utf-8');
  sampleMedicines = JSON.parse(medicinesData);
  console.log(`📄 Loaded ${sampleMedicines.length} medicines from ${medicinesFilePath}`);
} catch (error) {
  console.error('❌ Error reading medicines.json:', error.message);
  console.log('💡 Please ensure data/medicines.json exists with medicine data');
  process.exit(1);
}

const samplePharmacy = {
  name: 'HealthPlus Pharmacy',
  ownerName: 'Dr. Rajesh Kumar',
  address: '123 Main Street, Medical District',
  location: 'Mumbai',
  phone: '+91-9876543210',
  email: 'healthplus@example.com',
  isApproved: true
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medassist_now');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing medicines, pharmacies, and inventory...');
    await Medicine.deleteMany({});
    await Pharmacy.deleteMany({});
    await Inventory.deleteMany({});

    // Create pharmacy
    console.log('🏥 Creating sample pharmacy...');
    const pharmacy = await Pharmacy.create(samplePharmacy);
    console.log(`✅ Created pharmacy: ${pharmacy.name}`);

    // Create medicines
    console.log('💊 Creating sample medicines...');
    const medicines = await Medicine.insertMany(sampleMedicines);
    console.log(`✅ Created ${medicines.length} medicines`);

    // Create inventory for each medicine
    console.log('📦 Creating inventory...');
    const inventoryItems = medicines.map(medicine => ({
      medicineId: medicine._id,
      pharmacyId: pharmacy._id,
      quantity: 100, // Fixed stock of 100 units
      price: medicine.price,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }));

    await Inventory.insertMany(inventoryItems);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log(`📊 Total Medicines: ${medicines.length}`);
    console.log(`🏥 Total Pharmacies: 1`);
    console.log(`📦 Total Inventory Items: ${inventoryItems.length}`);
    console.log('========================================');
    console.log('🔍 Try searching for:');
    console.log('   - paracetamol');
    console.log('   - vitamin');
    console.log('   - antibiotic');
    console.log('   - fever');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
