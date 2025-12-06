/*
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
















































































































































};  changePassword  deleteUser,  updateUser,  getUserById,  getUsers,
nmodule.exports = {};  }    return errorResponse(res, error.message || 'Failed to change password', 500);    console.error('Change password error:', error);  } catch (error) {
n    return successResponse(res, 'Password changed successfully');    await user.save();    user.password = hashedPassword;    const hashedPassword = await hashPassword(newPassword);
n    // Hash and update new password    }      return errorResponse(res, 'Current password is incorrect', 401);    if (!isMatch) {    const isMatch = await comparePassword(currentPassword, user.password);
n    // Verify current password    }      return errorResponse(res, 'User not found', 404);    if (!user) {    const user = await User.findById(req.params.id);
n    // Find user    }      return errorResponse(res, 'Current password and new password are required', 400);
n    if (!currentPassword || !newPassword) {    const { currentPassword, newPassword } = req.body;  try {const changePassword = async (req, res) => { */ * PUT /api/users/:id/password * Change user password/**};  }    return errorResponse(res, error.message || 'Failed to delete user', 500);    console.error('Delete user error:', error);  } catch (error) {
n    return successResponse(res, 'User deleted successfully');    }      return errorResponse(res, 'User not found', 404);    if (!user) {        const user = await User.findByIdAndDelete(req.params.id);  try {const deleteUser = async (req, res) => { */ * DELETE /api/users/:id * Delete user/**};  }    return errorResponse(res, error.message || 'Failed to update user', 500);    console.error('Update user error:', error);  } catch (error) {
n    return successResponse(res, 'User updated successfully', { user });    }      return errorResponse(res, 'User not found', 404);
n    if (!user) {    ).select('-password');      { new: true, runValidators: true }      updateData,      req.params.id,    const user = await User.findByIdAndUpdate(    }      updateData.bankDetails = bankDetails;    if (bankDetails && typeof bankDetails === 'object' && Object.keys(bankDetails).length > 0) {        }      updateData.operatingHours = operatingHours;    if (operatingHours && typeof operatingHours === 'object' && Object.keys(operatingHours).length > 0) {        if (gstNumber) updateData.gstNumber = gstNumber;    if (pharmacyName) updateData.pharmacyName = pharmacyName;    if (licenseExpiry) updateData.licenseExpiry = licenseExpiry;    if (licenseNumber) updateData.licenseNumber = licenseNumber;    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;    if (vehicleType) updateData.vehicleType = vehicleType;        }      updateData.address = address;    if (address && typeof address === 'object' && Object.keys(address).length > 0) {    // Only set embedded documents if they are objects with keys        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;    if (phone) updateData.phone = phone;    if (name) updateData.name = name;        const updateData = {};
n    // Build update object    } = req.body;      bankDetails      operatingHours,      gstNumber,      pharmacyName,      licenseExpiry,      licenseNumber,      vehicleNumber,      vehicleType,      address,      dateOfBirth,      phone,      name,    const {  try {const updateUser = async (req, res) => { */ * PUT /api/users/:id * Update user/**};  }    return errorResponse(res, error.message || 'Failed to get user', 500);    console.error('Get user error:', error);  } catch (error) {
n    return successResponse(res, 'User retrieved successfully', { user });    }      return errorResponse(res, 'User not found', 404);    if (!user) {        const user = await User.findById(req.params.id).select('-password');  try {const getUserById = async (req, res) => { */ * GET /api/users/:id * Get user by ID/**};  }    return errorResponse(res, error.message || 'Failed to get users', 500);    console.error('Get users error:', error);  } catch (error) {    return successResponse(res, 'Users retrieved successfully', { users });    n    const users = await User.find(filter).select('-password');