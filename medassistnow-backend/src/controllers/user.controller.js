/**
 * User Controller
 * Handles user CRUD operations and profile management
 */

const User = require('../models/User.model');
const { hashPassword, comparePassword } = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all users
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password');
    
    return successResponse(res, 'Users retrieved successfully', { users });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, error.message || 'Failed to get users', 500);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User retrieved successfully', { user });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, error.message || 'Failed to get user', 500);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      address,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      licenseExpiry,
      pharmacyName,
      gstNumber,
      operatingHours,
      bankDetails
    } = req.body;

    // Build update object
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    
    // Only set embedded documents if they are objects with keys
    if (address && typeof address === 'object' && Object.keys(address).length > 0) {
      updateData.address = address;
    }
    
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (licenseExpiry) updateData.licenseExpiry = licenseExpiry;
    if (pharmacyName) updateData.pharmacyName = pharmacyName;
    if (gstNumber) updateData.gstNumber = gstNumber;
    
    if (operatingHours && typeof operatingHours === 'object' && Object.keys(operatingHours).length > 0) {
      updateData.operatingHours = operatingHours;
    }
    
    if (bankDetails && typeof bankDetails === 'object' && Object.keys(bankDetails).length > 0) {
      updateData.bankDetails = bankDetails;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User updated successfully', { user });
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse(res, error.message || 'Failed to update user', 500);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, error.message || 'Failed to delete user', 500);
  }
};

/**
 * Change user password
 * PUT /api/users/:id/password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, error.message || 'Failed to change password', 500);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
};
