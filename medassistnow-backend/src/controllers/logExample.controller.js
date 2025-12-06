/*
 * Log Example Controller
 * Demonstrate different log levels
 */

const logger = require('../utils/logger');
const { successResponse } = require('../utils/apiResponse');

/**
 * Test logging functionality
 * GET /api/log/test
 */
const test = (req, res) => {
  // Log different levels
  logger.info('This is an INFO log - Normal operation');
  logger.warn('This is a WARN log - Something needs attention');
  logger.error('This is an ERROR log - Something went wrong');
  
  return successResponse(res, 'Log test successful', {
    message: 'Check console and logs/app.log for logged messages',
    levels: ['info', 'warn', 'error']
  });
};



};  testnmodule.exports = {