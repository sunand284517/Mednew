/**
 * Verify Admin User in Database
 */

const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function verifyAdmin() {
  try {
    const mongoUri = 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@medassistnow.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database!');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Admin user found!');
    console.log('');
    console.log('========================================');
    console.log('USER DETAILS:');
    console.log('========================================');
    console.log('ID:', adminUser._id);
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Password Hash:', adminUser.password.substring(0, 20) + '...');
    console.log('Created At:', adminUser.createdAt);
    console.log('========================================');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdmin();
