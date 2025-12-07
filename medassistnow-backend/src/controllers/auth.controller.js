/**
 * Auth Controller
 * Handles user authentication (login, register)
 */

const User = require('../models/User.model');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      phone,
      address
    });

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Return response without password
    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, 'User registered successfully', {
      token,
      user: userData
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, error.message || 'Registration failed', 500);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Return response without password
    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, 'Login successful', {
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message || 'Login failed', 500);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User retrieved successfully', { user });

  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, error.message || 'Failed to get user', 500);
  }
};

module.exports = {
  register,
  login,
  getMe
};
