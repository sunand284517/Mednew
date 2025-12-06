/**
 * Metrics Middleware
 * Track HTTP requests for Prometheus
 */

const { httpRequestCounter, httpRequestDuration } = require('../config/prometheus');

/**
 * Middleware to collect metrics for each HTTP request
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Capture response finish event
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Increment request counter
    httpRequestCounter.inc({
      method,
      route,
      status_code: statusCode
    });
    
    // Record request duration
    httpRequestDuration.observe({
      method,
      route,
      status_code: statusCode
    }, duration);
  });
  
  next();
};

module.exports = metricsMiddleware;
