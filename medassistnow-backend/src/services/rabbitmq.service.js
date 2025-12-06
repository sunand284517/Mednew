/**
 * RabbitMQ Service
 * Handles message queue operations for async task processing
 */

const { getChannel } = require('../config/rabbitmq');

// Queue names
const QUEUES = {
  EMAIL: 'email_queue',
  ORDER: 'order_queue',
  NOTIFICATION: 'notification_queue',
  PAYMENT: 'payment_queue',
  DATA_SYNC: 'data_sync_queue'
};

class RabbitMQService {
  constructor() {
    this.channel = null;
    this.queues = QUEUES;
  }

  /**
   * Initialize service and declare queues
   */
  async initialize() {
    try {
      this.channel = getChannel();
      
      // Declare all queues
      for (const queueName of Object.values(QUEUES)) {
        try {
          await this.channel.assertQueue(queueName, {
            durable: true, // Queue survives broker restart
            maxPriority: 10 // Enable priority messaging
          });
          console.log(`✅ Queue declared: ${queueName}`);
        } catch (queueError) {
          if (queueError.message.includes('PRECONDITION_FAILED')) {
            console.error(`❌ Queue ${queueName} exists with different properties.`);
            console.error(`💡 Solution: Run 'npm run reset:queues' to delete existing queues.`);
          }
          throw queueError;
        }
      }

      return this;
    } catch (error) {
      console.error('❌ RabbitMQ Service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Send message to queue
   * @param {string} queueName - Queue name
   * @param {object} message - Message data
   * @param {object} options - Message options (priority, persistent, etc.)
   */
  async sendToQueue(queueName, message, options = {}) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const sendOptions = {
        persistent: true, // Message survives broker restart
        priority: options.priority || 5,
        ...options
      };

      this.channel.sendToQueue(queueName, messageBuffer, sendOptions);
      console.log(`📤 Message sent to ${queueName}:`, message);
      return true;
    } catch (error) {
      console.error(`❌ Error sending to ${queueName}:`, error.message);
      return false;
    }
  }

  /**
   * Consume messages from queue
   * @param {string} queueName - Queue name
   * @param {function} callback - Message handler function
   * @param {object} options - Consume options
   */
  async consumeQueue(queueName, callback, options = {}) {
    try {
      const consumeOptions = {
        noAck: false, // Manual acknowledgment
        ...options
      };

      await this.channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`📥 Received from ${queueName}:`, content);
            
            // Process message
            await callback(content, msg);
            
            // Acknowledge message
            this.channel.ack(msg);
          } catch (error) {
            console.error(`❌ Error processing message from ${queueName}:`, error.message);
            
            // Reject and requeue message
            this.channel.nack(msg, false, true);
          }
        }
      }, consumeOptions);

      console.log(`✅ Consuming messages from: ${queueName}`);
    } catch (error) {
      console.error(`❌ Error consuming from ${queueName}:`, error.message);
      throw error;
    }
  }

  /**
   * Publish message to exchange (for fanout/topic patterns)
   * @param {string} exchange - Exchange name
   * @param {string} routingKey - Routing key
   * @param {object} message - Message data
   */
  async publishToExchange(exchange, routingKey, message) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true
      });
      
      console.log(`📤 Published to exchange ${exchange} with key ${routingKey}:`, message);
      return true;
    } catch (error) {
      console.error(`❌ Error publishing to exchange:`, error.message);
      return false;
    }
  }

  /**
   * Create and bind exchange
   * @param {string} exchangeName - Exchange name
   * @param {string} exchangeType - Exchange type (direct, fanout, topic, headers)
   */
  async createExchange(exchangeName, exchangeType = 'direct') {
    try {
      await this.channel.assertExchange(exchangeName, exchangeType, {
        durable: true
      });
      console.log(`✅ Exchange created: ${exchangeName} (${exchangeType})`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating exchange:`, error.message);
      return false;
    }
  }

  /**
   * Bind queue to exchange
   * @param {string} queueName - Queue name
   * @param {string} exchangeName - Exchange name
   * @param {string} routingKey - Routing key
   */
  async bindQueue(queueName, exchangeName, routingKey) {
    try {
      await this.channel.bindQueue(queueName, exchangeName, routingKey);
      console.log(`✅ Queue ${queueName} bound to exchange ${exchangeName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error binding queue:`, error.message);
      return false;
    }
  }

  /**
   * Get queue information
   * @param {string} queueName - Queue name
   */
  async getQueueInfo(queueName) {
    try {
      const info = await this.channel.checkQueue(queueName);
      return {
        queue: info.queue,
        messageCount: info.messageCount,
        consumerCount: info.consumerCount
      };
    } catch (error) {
      console.error(`❌ Error getting queue info:`, error.message);
      return null;
    }
  }

  /**
   * Purge all messages from queue
   * @param {string} queueName - Queue name
   */
  async purgeQueue(queueName) {
    try {
      await this.channel.purgeQueue(queueName);
      console.log(`✅ Queue purged: ${queueName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error purging queue:`, error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new RabbitMQService();
