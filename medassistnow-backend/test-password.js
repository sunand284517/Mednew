/**
 * Test Password Comparison
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function testPassword() {
  try {
    const mongoUri = 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@medassistnow.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('Testing password comparison...');
    console.log('');
    
    // Test password
    const passwordToTest = 'Admin@123';
    const isMatch = await bcrypt.compare(passwordToTest, adminUser.password);
    
    console.log('Password entered:', passwordToTest);
    console.log('Hash in database:', adminUser.password);
    console.log('Password match:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
    console.log('');
    
    if (!isMatch) {
      console.log('Password mismatch! Let\'s delete and recreate...');
      
      // Delete the old user
      await User.deleteOne({ email: 'admin@medassistnow.com' });
      console.log('✅ Old user deleted');
      
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
      console.log('Email: admin@medassistnow.com');
      console.log('Password: Admin@123');
      console.log('');
      
      // Verify the new password
      const newIsMatch = await bcrypt.compare('Admin@123', newAdmin.password);
      console.log('New password verification:', newIsMatch ? '✅ VERIFIED' : '❌ FAILED');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPassword();
