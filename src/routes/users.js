const express = require('express');
const { registerUser, getUserProfile, updateUserProfile, getAllUsers, getUserById } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, updateUserProfile);

// Get all users (admin only)
router.get('/getalluser', protect, authorize('admin'), getAllUsers);

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), getUserById);


module.exports = router;