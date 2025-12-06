/*
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

























































































































};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: `Queue ${queueName} purged successfully`      success: true,
n    res.status(200).json({
n    await rabbitmqService.purgeQueue(queueName);    const { queueName } = req.params;  try {exports.purgeQueue = async (req, res) => { */ * Purge a queue/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      data: stats      success: true,
n    res.status(200).json({    }      stats[key.toLowerCase()] = info;      const info = await rabbitmqService.getQueueInfo(queueName);
n    for (const [key, queueName] of Object.entries(rabbitmqService.queues)) {    const stats = {};  try {exports.getQueueStats = async (req, res) => { */ * Get queue statistics/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Notification queued successfully'      success: true,
n    res.status(200).json({    }      await notificationQueue.sendInAppNotification(userId, title, message);    } else {      await notificationQueue.sendSMS(req.body.phoneNumber, message);    } else if (type === 'sms') {      await notificationQueue.sendPushNotification(userId, title, message);
n    if (type === 'push') {    const { userId, title, message, type = 'in_app' } = req.body;  try {exports.sendNotification = async (req, res) => { */ * Send notification/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Order queued for processing'      success: true,
n    res.status(200).json({
n    await orderQueue.processOrder(orderData);    const orderData = req.body;  try {exports.processOrder = async (req, res) => { */ * Process order/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Welcome email queued successfully'      success: true,
n    res.status(200).json({
n    await emailQueue.sendWelcomeEmail(email, name);    const { email, name } = req.body;  try {exports.sendWelcomeEmail = async (req, res) => { */ * Send welcome email/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Email queued successfully'      success: true,
n    res.status(200).json({    });      priority: 5      body: body || 'This is a test email from RabbitMQ',      subject: subject || 'Test Email',      to: to || 'test@example.com',n    await emailQueue.addToQueue({