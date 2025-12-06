/**
 * Order Routes
 * Handle order-related endpoints
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/orders - Create order
router.post('/', orderController.createOrder);

// GET /api/orders/my-orders - Get current user's orders (requires auth)
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

// GET /api/orders/pharmacy-orders - Get orders for current pharmacy (requires auth)
router.get('/pharmacy-orders', authMiddleware, orderController.getPharmacyOrders);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', orderController.getOrderById);

// GET /api/orders/user/:userId - Get user orders
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/pharmacy/:pharmacyId - Get pharmacy orders by ID
router.get('/pharmacy/:pharmacyId', orderController.getOrdersByPharmacyId);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
