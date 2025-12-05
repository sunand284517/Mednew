/**
 * Request Logger Middleware
 * Log all incoming HTTP requests with response time
 */

const logger = require('../utils/logger');

/**
 * Middleware to log HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`;
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });
  
  next();
};

module.exports = requestLogger;
