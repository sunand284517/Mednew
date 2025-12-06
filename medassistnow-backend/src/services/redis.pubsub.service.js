/**
 * Redis Pub/Sub Service
 * Handles real-time event broadcasting and subscription
 */

const { createClient } = require('redis');
const { REDIS_HOST, REDIS_PORT } = require('../config/environment');

class RedisPubSubService {
  constructor() {
    this.publisher = null;
    this.subscriber = null;
    this.subscribers = new Map(); // Store channel subscribers
  }

  /**
   * Initialize publisher and subscriber clients
   */
  async initialize() {
    try {
      // Create separate clients for pub and sub
      this.publisher = createClient({
        socket: { host: REDIS_HOST, port: REDIS_PORT }
      });

      this.subscriber = createClient({
        socket: { host: REDIS_HOST, port: REDIS_PORT }
      });

      await this.publisher.connect();
      await this.subscriber.connect();

      console.log('✅ Redis Pub/Sub initialized');

      // Error handlers
      this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
      this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

      return this;
    } catch (error) {
      console.error('❌ Redis Pub/Sub initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Publish a message to a channel
   * @param {string} channel - Channel name
   * @param {object} message - Message to publish
   */
  async publish(channel, message) {
    try {
      const messageStr = JSON.stringify(message);
      await this.publisher.publish(channel, messageStr);
      console.log(`📤 Published to ${channel}:`, message);
      return true;
    } catch (error) {
      console.error(`❌ Publish error on ${channel}:`, error.message);
      return false;
    }
  }

  /**
   * Subscribe to a channel
   * @param {string} channel - Channel name
   * @param {function} callback - Callback function to handle messages
   */
  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          console.log(`📥 Received on ${channel}:`, parsedMessage);
          callback(parsedMessage);
        } catch (err) {
          console.error('Error parsing message:', err);
          callback(message);
        }
      });

      this.subscribers.set(channel, callback);
      console.log(`✅ Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error(`❌ Subscribe error on ${channel}:`, error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   * @param {string} channel - Channel name
   */
  async unsubscribe(channel) {
    try {
      await this.subscriber.unsubscribe(channel);
      this.subscribers.delete(channel);
      console.log(`✅ Unsubscribed from channel: ${channel}`);
    } catch (error) {
      console.error(`❌ Unsubscribe error on ${channel}:`, error.message);
    }
  }

  /**
   * Subscribe to multiple channels with pattern matching
   * @param {string} pattern - Pattern to match (e.g., 'order:*')
   * @param {function} callback - Callback function
   */
  async pSubscribe(pattern, callback) {
    try {
      await this.subscriber.pSubscribe(pattern, (message, channel) => {
        try {
          const parsedMessage = JSON.parse(message);
          console.log(`📥 Received on ${channel} (pattern: ${pattern}):`, parsedMessage);
          callback(parsedMessage, channel);
        } catch (err) {
          callback(message, channel);
        }
      });
      console.log(`✅ Subscribed to pattern: ${pattern}`);
    } catch (error) {
      console.error(`❌ Pattern subscribe error:`, error.message);
      throw error;
    }
  }

  /**
   * Disconnect clients
   */
  async disconnect() {
    try {
      if (this.publisher) await this.publisher.quit();
      if (this.subscriber) await this.subscriber.quit();
      console.log('✅ Redis Pub/Sub disconnected');
    } catch (error) {
      console.error('❌ Disconnect error:', error.message);
    }
  }
}

// Export singleton instance
module.exports = new RedisPubSubService();
