/*
 * Metrics Controller
 * Expose Prometheus metrics endpoint
 */

const { prometheusRegistry } = require('../config/prometheus');

/**
 * Get Prometheus metrics
 * GET /api/metrics
 */
const getMetrics = async (req, res) => {
  try {
    // Set correct content type for Prometheus
    res.set('Content-Type', prometheusRegistry.contentType);
    
    // Return metrics
    const metrics = await prometheusRegistry.metrics();
    res.send(metrics);
    
  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    res.status(500).send('Error fetching metrics');
  }
};



};  getMetricsnmodule.exports = {