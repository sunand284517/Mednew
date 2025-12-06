/*
 * Protected Controller
 * Test controller to verify JWT authentication
 */

const { successResponse } = require('../utils/apiResponse');

/**
 * Protected route - requires authentication
 * GET /api/auth/protected
 */
const getProtected = (req, res) => {
  return successResponse(res, 'Access granted', {
    message: 'You have access to this protected route',
    user: req.user
  });
};



};  getProtectednmodule.exports = {