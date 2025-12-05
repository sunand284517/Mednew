/**
 * Email Queue Handler
 * Processes email sending tasks from RabbitMQ
 */

const rabbitmqService = require('../services/rabbitmq.service');

class EmailQueue {
  constructor() {
    this.queueName = rabbitmqService.queues.EMAIL;
  }

  /**
   * Add email to queue
   * @param {object} emailData - Email data
   */
  async addToQueue(emailData) {
    const { to, subject, body, type = 'general', priority = 5 } = emailData;

    const message = {
      to,
      subject,
      body,
      type,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    return await rabbitmqService.sendToQueue(this.queueName, message, { priority });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userEmail, userName) {
    return await this.addToQueue({
      to: userEmail,
      subject: 'Welcome to MedAssistNow!',
      body: `Hello ${userName}, Welcome to our platform!`,
      type: 'welcome',
      priority: 7
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(userEmail, orderId, orderDetails) {
    return await this.addToQueue({
      to: userEmail,
      subject: `Order Confirmation - ${orderId}`,
      body: `Your order has been confirmed. Details: ${JSON.stringify(orderDetails)}`,
      type: 'order_confirmation',
      priority: 8
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(userEmail, resetToken) {
    return await this.addToQueue({
      to: userEmail,
      subject: 'Password Reset Request',
      body: `Reset your password using this token: ${resetToken}`,
      type: 'password_reset',
      priority: 9
    });
  }

  /**
   * Process email queue (consumer)
   */
  async processQueue() {
    await rabbitmqService.consumeQueue(this.queueName, async (message) => {
      console.log('📧 Processing email:', message);

      try {
        // Simulate email sending
        await this.sendEmail(message);
        console.log(`✅ Email sent to ${message.to}`);
      } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error; // Will trigger requeue
      }
    });
  }

  /**
   * Simulate email sending (replace with actual email service)
   */
  async sendEmail(emailData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📨 Email sent: ${emailData.subject} to ${emailData.to}`);
        resolve(true);
      }, 1000);
    });
  }
}

module.exports = new EmailQueue();
