/*
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
















































};  disconnectRabbitMQ  getChannel,  connectRabbitMQ,
nmodule.exports = {};  }    throw error;    console.error('❌ RabbitMQ disconnect error:', error.message);  } catch (error) {    }      console.log('✅ RabbitMQ disconnected successfully');      await connection.close();    if (connection) {    }      console.log('✅ RabbitMQ channel closed');      await channel.close();    if (channel) {  try {const disconnectRabbitMQ = async () => { */ * Close RabbitMQ connection/**};  return channel;  }    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');  if (!channel) {const getChannel = () => { */ * @returns {Channel} RabbitMQ channel * Get the RabbitMQ channel/**};  }    throw error;    console.error('❌ RabbitMQ connection failed:', error.message);  } catch (error) {
n    return { connection, channel };    });      console.warn('⚠️  RabbitMQ connection closed');
n    connection.on('close', () => {    });      console.error('❌ RabbitMQ connection error:', err.message);    connection.on('error', (err) => {n    // Handle connection events