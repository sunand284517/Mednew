/**
 * RabbitMQ Configuration
 * Message queue setup for background tasks
 */

const amqp = require('amqplib');
const { RABBITMQ_URL } = require('./environment');

// Store connection and channel globally
let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ server
 */
const connectRabbitMQ = async () => {
  try {
    // Create connection
    connection = await amqp.connect(RABBITMQ_URL);
    console.log('✅ RabbitMQ Connected:', RABBITMQ_URL.replace(/\/\/.*@/, '//***@')); // Hide credentials in logs
    
    // Create channel
    channel = await connection.createChannel();
    console.log('📡 RabbitMQ Channel created');

    // Handle connection events
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err.message);
    });

    connection.on('close', () => {
      console.warn('⚠️  RabbitMQ connection closed');
    });

    return { connection, channel };
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
    throw error;
  }
};

/**
 * Get the RabbitMQ channel
 * @returns {Channel} RabbitMQ channel
 */
const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');
  }
  return channel;
};

/**
 * Close RabbitMQ connection
 */
const disconnectRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      console.log('✅ RabbitMQ channel closed');
    }
    if (connection) {
      await connection.close();
      console.log('✅ RabbitMQ disconnected successfully');
    }
  } catch (error) {
    console.error('❌ RabbitMQ disconnect error:', error.message);
    throw error;
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  disconnectRabbitMQ
};
