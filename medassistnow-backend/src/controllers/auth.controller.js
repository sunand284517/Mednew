/*
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

























































































};  getMe  login,  register,
nmodule.exports = {};  }    return errorResponse(res, error.message || 'Failed to get user', 500);    console.error('GetMe error:', error);
n  } catch (error) {
n    return successResponse(res, 'User retrieved successfully', { user });    }      return errorResponse(res, 'User not found', 404);    if (!user) {        const user = await User.findById(req.user.id).select('-password');    // req.user is set by auth middleware  try {const getMe = async (req, res) => { */ * GET /api/auth/me * Get current user/**};  }    return errorResponse(res, error.message || 'Login failed', 500);    console.error('Login error:', error);  } catch (error) {    });      user: userData      token,    return successResponse(res, 'Login successful', {    delete userData.password;    const userData = user.toObject();    // Return response without password    });      role: user.role      email: user.email,      id: user._id,    const token = generateToken({    // Generate token    }      return errorResponse(res, 'Invalid email or password', 401);    if (!isMatch) {    const isMatch = await comparePassword(password, user.password);    // Compare password    }      return errorResponse(res, 'Invalid email or password', 401);    if (!user) {    const user = await User.findOne({ email: email.toLowerCase() });    // Find user by email    }      return errorResponse(res, 'Email and password are required', 400);    if (!email || !password) {    // Validate required fields    const { email, password } = req.body;  try {const login = async (req, res) => { */ * POST /api/auth/login * Login user/**};  }    return errorResponse(res, error.message || 'Registration failed', 500);    console.error('Register error:', error);
n  } catch (error) {    }, 201);      user: userData      token,
n    return successResponse(res, 'User registered successfully', {    delete userData.password;    const userData = user.toObject();
n    // Return response without password    });      role: user.role      email: user.email,      id: user._id,    const token = generateToken({n    // Generate token