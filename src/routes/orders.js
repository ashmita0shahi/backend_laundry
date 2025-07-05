const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getOrderById, 
    updateOrderStatus, 
    getOrderHistory,
    getAllOrders,
    getDashboardStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middleware/validate');

// @desc    Get dashboard statistics (admin only)
// @route   GET /api/orders/dashboard-stats
// @access  Private/Admin
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), getAllOrders);

// @desc    Get order history
// @route   GET /api/orders/history
// @access  Private
router.get('/history', protect, getOrderHistory);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, validateCreateOrder, createOrder);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id([0-9a-fA-F]{24})/status', protect, authorize('admin'), validateUpdateOrderStatus, updateOrderStatus);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id([0-9a-fA-F]{24})', protect, getOrderById);

module.exports = router;