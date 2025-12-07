/**
 * Database Configuration
 * MongoDB connection setup using Mongoose
 */

const mongoose = require('mongoose');
const { MONGODB_URI } = require('./environment');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Modern Mongoose no longer needs these options
      // useNewUrlParser and useUnifiedTopology are deprecated
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnect error:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
