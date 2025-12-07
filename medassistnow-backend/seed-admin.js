/**
 * Seed Admin User
 * Run this to create a test admin account
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./src/models/User.model');

async function seedAdmin() {
  try {
    // Connect to MongoDB with authentication
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@medassistnow.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@medassistnow.com');
      console.log('Password: Admin@123');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcryptjs.hash('Admin@123', 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@medassistnow.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91-9999999999',
      address: 'Admin Office, Medical District',
      isApproved: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('========================================');
    console.log('🔐 ADMIN LOGIN CREDENTIALS');
    console.log('========================================');
    console.log('Email: admin@medassistnow.com');
    console.log('Password: Admin@123');
    console.log('Login URL: http://localhost:3000/admin/login.html');
    console.log('Dashboard URL: http://localhost:3000/admin/dashboard.html');
    console.log('Analytics URL: http://localhost:3000/admin/analytics.html');
    console.log('========================================');
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
