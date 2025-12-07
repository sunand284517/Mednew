/**
 * Recreate Admin User with Correct Password
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function recreateAdmin() {
  try {
    const mongoUri = 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@medassistnow.com' });
    console.log('✅ Deleted old admin user');

    // Create new admin user with correct password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const newAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@medassistnow.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91-9999999999',
      address: {
        street: 'Admin Office',
        city: 'City',
        state: 'State',
        pincode: '000000'
      },
      isApproved: true
    });
    
    console.log('✅ New admin user created');
    console.log('');
    console.log('========================================');
    console.log('ADMIN LOGIN CREDENTIALS');
    console.log('========================================');
    console.log('Email: admin@medassistnow.com');
    console.log('Password: Admin@123');
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateAdmin();
