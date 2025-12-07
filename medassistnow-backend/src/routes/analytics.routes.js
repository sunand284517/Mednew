/*
 * Analytics Routes
 * Endpoints for admin dashboard analytics
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All analytics endpoints require admin authentication
router.use(authMiddleware);

// Top selling medicines
router.get('/medicines/top-selling', analyticsController.getTopMedicines);

// Pharmacy analytics
router.get('/pharmacies/analytics', analyticsController.getPharmacyAnalytics);

// Delivery partner analytics
router.get('/delivery-partners/analytics', analyticsController.getDeliveryPartnerAnalytics);

// Medicine inventory analytics
router.get('/medicines/inventory', analyticsController.getMedicineInventoryAnalytics);

// Dashboard summary
router.get('/dashboard/summary', analyticsController.getDashboardSummary);

// Hourly trends
router.get('/trends/hourly', analyticsController.getHourlyTrends);

// Category-wise analytics
router.get('/categories/analytics', analyticsController.getCategoryAnalytics);

module.exports = router;
