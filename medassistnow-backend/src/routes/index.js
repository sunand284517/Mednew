/**
 * Main API Routes
 * Central routing configuration for all API endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers
const cacheExampleController = require('../controllers/cacheExample.controller');
const queueExampleController = require('../controllers/queueExample.controller');
const authController = require('../controllers/auth.controller');
const protectedController = require('../controllers/protected.controller');
const metricsController = require('../controllers/metrics.controller');
const searchController = require('../controllers/search.controller');
const logExampleController = require('../controllers/logExample.controller');

// Import middleware
const authMiddleware = require('../middleware/auth.middleware');

// Import route modules
const userRoutes = require('./user.routes');
const pharmacyRoutes = require('./pharmacy.routes');
const medicineRoutes = require('./medicine.routes');
const inventoryRoutes = require('./inventory.routes');
const orderRoutes = require('./order.routes');
const deliveryRoutes = require('./delivery.routes');
const queueRoutes = require('./queue.routes');
const pubsubRoutes = require('./pubsub.routes');
const prescriptionRoutes = require('./prescription.routes');
const notificationRoutes = require('./notification.routes');
const analyticsRoutes = require('./analytics.routes');

// ========================================
// API Routes Configuration
// ========================================

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend running',
    timestamp: new Date().toISOString()
  });
});

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API routes are working',
    timestamp: new Date().toISOString()
  });
});

// Cache example route (Redis demonstration)
router.get('/cache/example', cacheExampleController.example);

// Queue example routes (RabbitMQ demonstration)
router.post('/queue/send', queueExampleController.sendMessage);
router.post('/queue/send-bulk', queueExampleController.sendBulkMessages);

// Authentication routes (JWT)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.get('/auth/protected', authMiddleware, protectedController.getProtected);

// Metrics route (Prometheus)
router.get('/metrics', metricsController.getMetrics);

// Search routes (Elasticsearch)
router.get('/search/medicines', searchController.searchMedicines);

// Log test route (Winston)
router.get('/log/test', logExampleController.test);

// ========================================
// Main Application Routes
// ========================================

router.use('/users', userRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/deliveries', deliveryRoutes); // Alias for delivery history
router.use('/prescriptions', prescriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

// New Queue and Pub/Sub routes
router.use('/queue', queueRoutes);
router.use('/pubsub', pubsubRoutes);

module.exports = router;
