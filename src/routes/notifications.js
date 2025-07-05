const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// @desc    Get all user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, getUserNotifications);

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, getUnreadCount);

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
router.put('/:notificationId/read', protect, markAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, markAllAsRead);

module.exports = router;
