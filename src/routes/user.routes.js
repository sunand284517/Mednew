/**
 * User Routes
 * Handle user-related endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/users - Get all users
router.get('/', userController.getUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// PUT /api/users/:id/password - Change password
router.put('/:id/password', userController.changePassword);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
