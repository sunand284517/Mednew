/*
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

































};  disconnectDB  connectDB,
nmodule.exports = {};  }    throw error;    console.error('❌ MongoDB disconnect error:', error.message);  } catch (error) {    console.log('✅ MongoDB disconnected successfully');    await mongoose.connection.close();  try {const disconnectDB = async () => { */ * Disconnect from MongoDB database/**};  }    throw error;    console.error('❌ MongoDB connection failed:', error.message);  } catch (error) {
n    return conn;    });      console.warn('⚠️  MongoDB disconnected');
n    mongoose.connection.on('disconnected', () => {    });      console.error('❌ MongoDB connection error:', err);    mongoose.connection.on('error', (err) => {    // Handle connection events        console.log(`📊 Database Name: ${conn.connection.name}`);n    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);