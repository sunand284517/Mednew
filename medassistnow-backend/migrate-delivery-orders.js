/**
 * Migrate Existing Delivery Orders to Elasticsearch
 * Logs all existing delivery orders to Kibana for visualization
 * 
 * Usage: node migrate-delivery-orders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order.model');
const deliveryLogger = require('./src/services/delivery-logger.service');
const { connectDB } = require('./src/config/database');
const { connectElasticsearch } = require('./src/config/elasticsearch');

async function migrateDeliveryOrders() {
  try {
    console.log('🚀 Starting delivery orders migration to Elasticsearch...');
    
    // Connect to databases
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    
    console.log('📡 Connecting to Elasticsearch...');
    await connectElasticsearch();
    
    // Initialize delivery index
    console.log('📋 Initializing delivery orders index...');
    await deliveryLogger.initializeDeliveryIndex();
    
    // Fetch all orders with delivery partner info
    console.log('📥 Fetching delivery orders from MongoDB...');
    const orders = await Order.find()
      .populate('deliveryPartner', 'name phone email')
      .populate('pharmacy', 'name address')
      .lean();
    
    console.log(`✅ Found ${orders.length} orders to migrate`);
    
    if (orders.length === 0) {
      console.log('ℹ️  No orders found to migrate');
      process.exit(0);
    }
    
    // Log each order to Elasticsearch
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < orders.length; i++) {
      try {
        const order = orders[i];
        await deliveryLogger.logDeliveryOrder(order);
        successCount++;
        
        // Show progress
        if ((i + 1) % 10 === 0) {
          console.log(`📊 Progress: ${i + 1}/${orders.length} orders migrated`);
        }
      } catch (error) {
        console.error(`❌ Error migrating order ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('');
    console.log('========================================');
    console.log('✅ Migration Complete');
    console.log('========================================');
    console.log(`✅ Successfully migrated: ${successCount} orders`);
    console.log(`❌ Failed: ${errorCount} orders`);
    console.log(`📊 Total: ${orders.length} orders`);
    console.log('');
    console.log('🎉 You can now view your delivery orders in Kibana:');
    console.log('   http://localhost:5601');
    console.log('');
    console.log('📋 Steps to view data:');
    console.log('   1. Go to Stack Management > Index Patterns');
    console.log('   2. Create index pattern: delivery-orders*');
    console.log('   3. Go to Analytics > Discover');
    console.log('   4. Select delivery-orders index pattern');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDeliveryOrders();
