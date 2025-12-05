/**
 * Pub/Sub Routes
 * API routes for Redis Pub/Sub operations
 */

const express = require('express');
const router = express.Router();
const pubsubController = require('../controllers/pubsub.controller');

// General pub/sub routes
router.post('/publish', pubsubController.publishMessage);
router.get('/test', pubsubController.testPubSub);

// Specific broadcast routes
router.post('/broadcast/order', pubsubController.broadcastOrderUpdate);
router.post('/broadcast/user', pubsubController.broadcastUserEvent);
router.post('/broadcast/medicine', pubsubController.broadcastMedicineUpdate);

module.exports = router;
