/**
 * Queue Routes
 * API routes for RabbitMQ queue operations
 */

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');

// Email queue routes
router.post('/email/test', queueController.sendTestEmail);
router.post('/email/welcome', queueController.sendWelcomeEmail);

// Order queue routes
router.post('/order/process', queueController.processOrder);

// Notification queue routes
router.post('/notification/send', queueController.sendNotification);

// Queue management routes
router.get('/stats', queueController.getQueueStats);
router.delete('/purge/:queueName', queueController.purgeQueue);

module.exports = router;
