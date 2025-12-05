/**
 * Delivery Partner Routes
 * Handle delivery partner endpoints
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const deliveryController = require('../controllers/delivery.controller');

// POST /api/delivery - Register delivery partner
router.post('/', deliveryController.registerDeliveryPartner);

// GET /api/delivery/available - Get available partners
router.get('/available', deliveryController.getAvailablePartners);

// GET /api/delivery/requests - Get delivery requests (packed orders)
router.get('/requests', authMiddleware, deliveryController.getDeliveryRequests);

// POST /api/delivery/requests/:id/accept - Accept a delivery request
router.post('/requests/:id/accept', authMiddleware, deliveryController.acceptDeliveryRequest);

// GET /api/delivery/stats - Get delivery partner stats
router.get('/stats', authMiddleware, deliveryController.getDeliveryStats);

// GET /api/delivery/earnings - Get delivery partner earnings
router.get('/earnings', authMiddleware, deliveryController.getDeliveryEarnings);

// GET /api/delivery/my-history - Get my delivery history  
router.get('/my-history', authMiddleware, deliveryController.getMyDeliveryHistory);

// PUT /api/delivery/orders/:id/status - Update delivery status
router.put('/orders/:id/status', authMiddleware, deliveryController.updateDeliveryStatus);

// PUT /api/delivery/:id/availability - Update availability
router.put('/:id/availability', deliveryController.updateAvailability);

module.exports = router;
