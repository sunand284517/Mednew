/**
 * Queue Controller
 * API endpoints to interact with RabbitMQ queues
 */

const emailQueue = require('../queues/email.queue');
const orderQueue = require('../queues/order.queue');
const notificationQueue = require('../queues/notification.queue');
const rabbitmqService = require('../services/rabbitmq.service');

/**
 * Send test email
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    await emailQueue.addToQueue({
      to: to || 'test@example.com',
      subject: subject || 'Test Email',
      body: body || 'This is a test email from RabbitMQ',
      priority: 5
    });

    res.status(200).json({
      success: true,
      message: 'Email queued successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    await emailQueue.sendWelcomeEmail(email, name);

    res.status(200).json({
      success: true,
      message: 'Welcome email queued successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Process order
 */
exports.processOrder = async (req, res) => {
  try {
    const orderData = req.body;

    await orderQueue.processOrder(orderData);

    res.status(200).json({
      success: true,
      message: 'Order queued for processing'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Send notification
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'in_app' } = req.body;

    if (type === 'push') {
      await notificationQueue.sendPushNotification(userId, title, message);
    } else if (type === 'sms') {
      await notificationQueue.sendSMS(req.body.phoneNumber, message);
    } else {
      await notificationQueue.sendInAppNotification(userId, title, message);
    }

    res.status(200).json({
      success: true,
      message: 'Notification queued successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get queue statistics
 */
exports.getQueueStats = async (req, res) => {
  try {
    const stats = {};

    for (const [key, queueName] of Object.entries(rabbitmqService.queues)) {
      const info = await rabbitmqService.getQueueInfo(queueName);
      stats[key.toLowerCase()] = info;
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Purge a queue
 */
exports.purgeQueue = async (req, res) => {
  try {
    const { queueName } = req.params;

    await rabbitmqService.purgeQueue(queueName);

    res.status(200).json({
      success: true,
      message: `Queue ${queueName} purged successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
