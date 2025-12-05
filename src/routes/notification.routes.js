/**
 * Notification Routes
 * API endpoints for notification management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
} = require('../controllers/notification.controller');

// All routes require authentication
router.use(authMiddleware);

// Get all notifications for the user
router.get('/', getNotifications);

// Get unread count only
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Mark a specific notification as read
router.put('/:id/read', markAsRead);

// Delete a specific notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

module.exports = router;
