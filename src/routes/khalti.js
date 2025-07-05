const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const { sendNotification } = require('../utils/notificationService');
const { getKhaltiConfig, verifyPayment, createPaymentData, initiatePayment } = require('../utils/khaltiHelper');

/**
 * @route   POST /api/khalti/initiate
 * @desc    Initiate Khalti payment (New API)
 * @access  Private
 */
router.post('/initiate', protect, async (req, res) => {
    const { orderId } = req.body;

    try {
        // Find the order
        const order = await Order.findById(orderId).populate('user', 'firstName lastName email phoneNumber');
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user is authorized
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to process payment for this order'
            });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Order has already been paid'
            });
        }

        // Update order payment method and status
        order.paymentMethod = 'khalti';
        order.paymentStatus = 'processing';
        await order.save();

        // Create payment data for new Khalti API
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify`;
        const paymentData = createPaymentData(
            order.totalAmount,
            order._id,
            {
                name: `${order.user.firstName} ${order.user.lastName}`,
                email: order.user.email,
                phone: order.user.phoneNumber
            },
            returnUrl
        );

        // Initiate payment with Khalti
        const khaltiResponse = await initiatePayment(paymentData);

        res.json({
            success: true,
            data: khaltiResponse
        });
    } catch (error) {
        console.error('Khalti initiation error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Payment initiation failed: ' + error.message
        });
    }
});

/**
 * @route   POST /api/khalti/verify
 * @desc    Verify Khalti payment (New API - Lookup)
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
    const { pidx, orderId } = req.body;

    if (!pidx) {
        return res.status(400).json({
            success: false,
            error: 'Payment identifier (pidx) is required'
        });
    }

    try {
        // Use the helper function to verify with Khalti API
        const response = await verifyPayment(pidx);

        // If order ID is provided, update the order status
        if (orderId) {
            const order = await Order.findById(orderId);
            if (order) {
                if (response.status === 'Completed') {
                    // Update order payment details
                    order.paymentStatus = 'completed';
                    order.paymentDetails = {
                        transactionId: response.transaction_id,
                        paymentDate: new Date()
                    };

                    // If order is still pending, update to confirmed
                    if (order.status === 'pending') {
                        order.status = 'confirmed';
                        order.statusHistory.push({
                            status: 'confirmed',
                            timestamp: new Date(),
                            note: 'Order confirmed after payment'
                        });
                    }

                    await order.save();

                    // Send notification to user
                    await sendNotification(
                        order.user,
                        `Your payment for order #${order._id} was successful. Thank you!`,
                        'payment',
                        true
                    );
                }
            }
        }

        res.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('Khalti verification error:', error.message);
        res.status(400).json({
            success: false,
            error: 'Payment verification failed: ' + error.message,
        });
    }
});

/**
 * @route   GET /api/khalti/callback
 * @desc    Handle Khalti payment callback
 * @access  Public
 */
router.get('/callback', async (req, res) => {
    const { pidx, txnId, amount, total_amount, status, mobile, purchase_order_id } = req.query;

    if (!pidx || !purchase_order_id) {
        return res.status(400).json({
            success: false,
            error: 'Required payment parameters missing'
        });
    }

    try {
        // Find the order
        const order = await Order.findById(purchase_order_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Verify the payment using lookup API
        const paymentVerification = await verifyPayment(pidx);

        if (paymentVerification && paymentVerification.status === 'Completed') {
            // Update order payment details
            order.paymentStatus = 'completed';
            order.paymentDetails = {
                transactionId: paymentVerification.transaction_id,
                paymentDate: new Date()
            };

            // If order is still pending, update to confirmed
            if (order.status === 'pending') {
                order.status = 'confirmed';
                order.statusHistory.push({
                    status: 'confirmed',
                    timestamp: new Date(),
                    note: 'Order confirmed after payment'
                });
            }

            await order.save();

            // Send notification to user
            await sendNotification(
                order.user,
                `Your payment for order #${order._id} was successful!`,
                'payment',
                true
            );

            res.json({
                success: true,
                message: 'Payment completed successfully',
                data: { order }
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Payment verification failed',
                status: paymentVerification.status
            });
        }
    } catch (error) {
        console.error('Khalti callback error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Payment callback processing failed'
        });
    }
});

/**
 * @route   GET /api/khalti/config
 * @desc    Get Khalti configuration for frontend
 * @access  Public
 */
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: getKhaltiConfig()
    });
});

module.exports = router;
