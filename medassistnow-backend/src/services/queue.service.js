/**
 * Queue Service
 * Simple service for sending messages to RabbitMQ queues
 */

const { getChannel } = require('../config/rabbitmq');

/**
 * Send message to a RabbitMQ queue
 * @param {String} queueName - Name of the queue
 * @param {Object|String} payload - Message payload (will be JSON stringified)
 * @returns {Boolean} - True if sent successfully
 */
const sendToQueue = async (queueName, payload) => {
  try {
    // Get RabbitMQ channel
    const channel = getChannel();
    
    // Ensure queue exists (creates if not present)
    await channel.assertQueue(queueName, {
      durable: true // Queue survives RabbitMQ restarts
    });
    
    // Convert payload to JSON string
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    // Send message to queue
    const sent = channel.sendToQueue(
      queueName,
      Buffer.from(message),
      {
        persistent: true // Message survives RabbitMQ restarts
      }
    );
    
    if (sent) {
      console.log(`✅ Message sent to queue "${queueName}":`, message);
      return true;
    } else {
      console.warn(`⚠️  Message buffered for queue "${queueName}"`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error sending message to queue "${queueName}":`, error.message);
    throw error;
  }
};

/**
 * Create a queue (without sending a message)
 * @param {String} queueName - Name of the queue to create
 */
const createQueue = async (queueName) => {
  try {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });
    console.log(`✅ Queue "${queueName}" created/verified`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating queue "${queueName}":`, error.message);
    throw error;
  }
};

module.exports = {
  sendToQueue,
  createQueue
};
