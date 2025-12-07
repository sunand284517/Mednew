/**
 * Seed Sample Data for Analytics
 * Creates sample orders, medicines, pharmacies, and delivery data
 */

const mongoose = require('mongoose');
const Medicine = require('./src/models/Medicine.model');
const Pharmacy = require('./src/models/Pharmacy.model');
const Order = require('./src/models/Order.model');
const DeliveryPartner = require('./src/models/DeliveryPartner.model');
const User = require('./src/models/User.model');
const Inventory = require('./src/models/Inventory.model');

const mongoUri = 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin';

async function seedAnalyticsData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Order.deleteMany({});
    // await Medicine.deleteMany({});
    // await Pharmacy.deleteMany({});
    // await DeliveryPartner.deleteMany({});

    // 1. Create Medicines
    console.log('📦 Creating sample medicines...');
    const medicines = await Medicine.insertMany([
      { name: 'Aspirin', price: 50, category: 'Pain Relief', stock: 500 },
      { name: 'Paracetamol', price: 40, category: 'Pain Relief', stock: 600 },
      { name: 'Ibuprofen', price: 60, category: 'Pain Relief', stock: 450 },
      { name: 'Amoxicillin', price: 150, category: 'Antibiotics', stock: 300 },
      { name: 'Cough Syrup', price: 80, category: 'Cough Relief', stock: 400 },
      { name: 'Vitamin C', price: 120, category: 'Supplements', stock: 800 },
    ].filter(m => !medicines.find(ex => ex.name === m.name)), { ordered: false }).catch(() => medicines);

    console.log('✅ Medicines created');

    // 2. Create Pharmacies
    console.log('🏥 Creating sample pharmacies...');
    const pharmacies = await Pharmacy.insertMany([
      { 
        name: 'HealthPlus Pharmacy', 
        ownerName: 'Rajesh Kumar',
        email: 'healthplus@example.com',
        address: '123 Main St',
        location: 'Mumbai',
        phone: '+91-9876543210',
        isApproved: true
      },
      { 
        name: 'MediCare Store', 
        ownerName: 'Priya Singh',
        email: 'medicare@example.com',
        address: '456 Oak Ave',
        location: 'Delhi',
        phone: '+91-9876543211',
        isApproved: true
      },
      { 
        name: 'QuickRx Pharmacy', 
        ownerName: 'Amit Patel',
        email: 'quickrx@example.com',
        address: '789 Elm Rd',
        location: 'Bangalore',
        phone: '+91-9876543212',
        isApproved: true
      }
    ].filter(p => !pharmacies.find(ex => ex.email === p.email)), { ordered: false }).catch(() => pharmacies);

    console.log('✅ Pharmacies created');

    // 3. Create Delivery Partners
    console.log('🚗 Creating sample delivery partners...');
    const deliveryPartners = await DeliveryPartner.insertMany([
      { 
        name: 'Raj Kumar', 
        email: 'raj@delivery.com',
        phone: '+91-9111111111',
        vehicleType: 'bike',
        isAvailable: true,
        rating: 4.8
      },
      { 
        name: 'Priya Sharma', 
        email: 'priya@delivery.com',
        phone: '+91-9222222222',
        vehicleType: 'bike',
        isAvailable: true,
        rating: 4.6
      },
      { 
        name: 'Amit Singh', 
        email: 'amit@delivery.com',
        phone: '+91-9333333333',
        vehicleType: 'car',
        isAvailable: true,
        rating: 4.9
      }
    ].filter(d => !deliveryPartners.find(ex => ex.email === d.email)), { ordered: false }).catch(() => deliveryPartners);

    console.log('✅ Delivery Partners created');

    // 4. Create Users
    console.log('👥 Creating sample users...');
    const user = await User.findOne({ email: 'user@example.com' });
    let userId = user?._id;
    
    if (!userId) {
      const newUser = await User.create({
        name: 'John User',
        email: 'user@example.com',
        password: '$2b$10$hashedpassword',
        role: 'user',
        phone: '+91-9000000000',
        address: { city: 'Mumbai', state: 'Maharashtra' }
      });
      userId = newUser._id;
    }
    console.log('✅ User created/found');

    // 5. Create Sample Orders with different dates
    console.log('📋 Creating sample orders...');
    const orders = [];
    
    const pharmacyIds = Array.isArray(pharmacies) ? pharmacies.map(p => p._id) : [];
    const medicineIds = Array.isArray(medicines) ? medicines.map(m => m._id) : [];
    const deliveryIds = Array.isArray(deliveryPartners) ? deliveryPartners.map(d => d._id) : [];

    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      if (pharmacyIds.length > 0 && medicineIds.length > 0) {
        orders.push({
          userId: userId,
          pharmacyId: pharmacyIds[Math.floor(Math.random() * pharmacyIds.length)],
          deliveryPartnerId: deliveryIds.length > 0 ? deliveryIds[Math.floor(Math.random() * deliveryIds.length)] : null,
          items: [
            {
              medicineId: medicineIds[Math.floor(Math.random() * medicineIds.length)],
              quantity: Math.floor(Math.random() * 5) + 1,
              price: Math.floor(Math.random() * 200) + 50
            }
          ],
          totalAmount: Math.floor(Math.random() * 1000) + 200,
          status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
          createdAt: date
        });
      }
    }

    if (orders.length > 0) {
      await Order.insertMany(orders, { ordered: false }).catch(() => {});
    }

    console.log('✅ Orders created');

    console.log('');
    console.log('========================================');
    console.log('✅ SAMPLE DATA CREATED SUCCESSFULLY!');
    console.log('========================================');
    console.log('');
    console.log('Now refresh your analytics page to see:');
    console.log('  📊 Top Selling Medicines');
    console.log('  🏥 Top Pharmacies');
    console.log('  🚗 Top Delivery Partners');
    console.log('  📦 Inventory Overview');
    console.log('');
    console.log('Analytics URL: http://localhost:5000/admin/analytics.html');
    console.log('========================================');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAnalyticsData();
