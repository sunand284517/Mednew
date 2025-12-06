/*
 * Auth Middleware
 * JWT token verification middleware
 */

const { verifyToken } = require('../services/auth.service');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Verify JWT token from Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user to request
    req.user = decoded;
    
    next();
    











nmodule.exports = authMiddleware;};  }    return errorResponse(res, 'Authentication failed', 401);    }      return errorResponse(res, 'Token expired', 401);    if (error.name === 'TokenExpiredError') {    }      return errorResponse(res, 'Invalid token', 401);    if (error.name === 'JsonWebTokenError') {n  } catch (error) {