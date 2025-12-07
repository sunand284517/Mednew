/**
 * Delivery Analytics Routes
 * Exposes delivery order analytics and Kibana data
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const deliveryLogger = require('../services/delivery-logger.service');

/**
 * GET /api/delivery-analytics/partner-orders/:partnerId
 * Get all orders for a specific delivery partner
 */
router.get('/partner-orders/:partnerId', authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { limit = 50, offset = 0, status } = req.query;

    const orders = await deliveryLogger.getDeliveryPartnerOrders(partnerId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status: status || null
    });

    res.status(200).json({
      success: true,
      message: 'Delivery partner orders retrieved',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching delivery partner orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery partner orders',
      error: error.message
    });
  }
});

/**
 * GET /api/delivery-analytics/summary
 * Get delivery analytics by partner for admin dashboard
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    const analytics = await deliveryLogger.getDeliveryAnalytics(timeRange);

    res.status(200).json({
      success: true,
      message: 'Delivery analytics retrieved',
      data: {
        timeRange,
        partners: analytics,
        totalPartners: analytics.length,
        totalDeliveries: analytics.reduce((sum, p) => sum + p.totalDeliveries, 0),
        totalEarnings: analytics.reduce((sum, p) => sum + parseFloat(p.totalEarnings), 0).toFixed(2),
        avgRating: (analytics.reduce((sum, p) => sum + parseFloat(p.avgRating), 0) / analytics.length).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching delivery analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/delivery-analytics/kibana-info
 * Get Kibana connection info and dashboard instructions
 */
router.get('/kibana-info', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kibana information',
    data: {
      kibanaUrl: 'http://localhost:5601',
      elasticsearchUrl: 'http://localhost:9200',
      indexName: 'delivery-orders',
      instructions: {
        step1: 'Open Kibana: http://localhost:5601',
        step2: 'Go to Analytics > Discover',
        step3: 'Create index pattern: delivery-orders*',
        step4: 'View delivery orders by delivery partner',
        step5: 'Create visualizations and dashboards',
        fields: [
          'deliveryPartnerId - Partner ID',
          'partnerName - Partner Name',
          'status - Delivery Status (pending, in-transit, completed, cancelled)',
          'orderTotal - Order Amount',
          'deliveryFee - Delivery Fee',
          'rating - Delivery Rating (0-5)',
          'actualTime - Actual Delivery Time (minutes)',
          'createdAt - Order Creation Date'
        ]
      }
    }
  });
});

module.exports = router;
