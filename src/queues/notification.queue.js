/**
 * Notification Queue Handler
 * Processes notification tasks from RabbitMQ
 */

const rabbitmqService = require('../services/rabbitmq.service');
const redisPubSub = require('../services/redis.pubsub.service');

class NotificationQueue {
  constructor() {
    this.queueName = rabbitmqService.queues.NOTIFICATION;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, title, message, data = {}) {
    const notification = {
      type: 'push',
      userId,
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    return await rabbitmqService.sendToQueue(this.queueName, notification, { priority: 7 });
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber, message) {
    const notification = {
      type: 'sms',
      phoneNumber,
      message,
      timestamp: new Date().toISOString()
    };

    return await rabbitmqService.sendToQueue(this.queueName, notification, { priority: 8 });
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(userId, title, message, link = null) {
    const notification = {
      type: 'in_app',
      userId,
      title,
      message,
      link,
      read: false,
      timestamp: new Date().toISOString()
    };

    // Send to queue for processing
    await rabbitmqService.sendToQueue(this.queueName, notification, { priority: 6 });

    // Also publish to Redis for real-time delivery
    await redisPubSub.publish(`notifications:${userId}`, notification);

    return true;
  }

  /**
   * Process notification queue (consumer)
   */
  async processQueue() {
    await rabbitmqService.consumeQueue(this.queueName, async (message) => {
      console.log('🔔 Processing notification:', message);

      try {
        switch (message.type) {
          case 'push':
            await this.handlePushNotification(message);
            break;
          case 'sms':
            await this.handleSMS(message);
            break;
          case 'in_app':
            await this.handleInAppNotification(message);
            break;
          default:
            console.warn('Unknown notification type:', message.type);
        }

        console.log(`✅ Notification sent: ${message.type}`);
      } catch (error) {
        console.error('❌ Notification sending failed:', error.message);
        throw error;
      }
    });
  }

  /**
   * Handle push notification
   */
  async handlePushNotification(data) {
    console.log(`📱 Sending push notification to user ${data.userId}`);
    // Integrate with FCM, OneSignal, or other push service
    await this.delay(500);
    return true;
  }

  /**
   * Handle SMS
   */
  async handleSMS(data) {
    console.log(`📲 Sending SMS to ${data.phoneNumber}`);
    // Integrate with Twilio, AWS SNS, or other SMS service
    await this.delay(500);
    return true;
  }

  /**
   * Handle in-app notification
   */
  async handleInAppNotification(data) {
    console.log(`💬 Storing in-app notification for user ${data.userId}`);
    // Store in database
    // await Notification.create(data);
    await this.delay(300);
    return true;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new NotificationQueue();
