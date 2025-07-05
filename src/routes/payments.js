const express = require('express');
const router = express.Router();
const { 
    initiatePayment, 
    verifyPayment, 
    getPaymentHistory,
    handleKhaltiCallback,
    getPaymentStats
} = require('../controllers/paymentController');
const { validatePayment, validateVerifyPayment } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

// @desc    Initiate a payment
// @route   POST /api/payments/initiate
// @access  Private
router.post('/initiate', protect, validatePayment, initiatePayment);

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, validateVerifyPayment, verifyPayment);

// @desc    Handle Khalti callback
// @route   GET /api/payments/khalti/callback
// @access  Public
router.get('/khalti/callback', handleKhaltiCallback);

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, getPaymentHistory);

// @desc    Get payment statistics (admin only)
// @route   GET /api/payments/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), getPaymentStats);

module.exports = router;