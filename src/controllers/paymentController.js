const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { createPaymentData, initiatePayment, verifyPayment } = require('../utils/khaltiHelper');
const { sendNotification } = require('../utils/notificationService');

// Initiate a new payment
exports.initiatePayment = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;
        
        // Find the order
        const order = await Order.findById(orderId).populate('user', 'firstName lastName email phoneNumber');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user is authorized to make payment
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to make payment for this order'
            });
        }
        
        // Check if order is already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order has already been paid'
            });
        }
        
        // Update payment method
        order.paymentMethod = paymentMethod;
        order.paymentStatus = 'processing';
        await order.save();
        
        // For Khalti payment, initiate payment with new API
        if (paymentMethod === 'khalti') {
            const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify`;
            
            const paymentData = createPaymentData(
                order.totalAmount,
                orderId,
                {
                    name: `${order.user.firstName} ${order.user.lastName}`,
                    email: order.user.email,
                    phone: order.user.phoneNumber
                },
                returnUrl
            );
            
            // Initiate payment with Khalti
            const khaltiResponse = await initiatePayment(paymentData);
            
            // Create a payment record
            const payment = new Payment({
                order: orderId,
                amount: order.totalAmount,
                method: paymentMethod,
                status: 'processing',
                transactionId: khaltiResponse.pidx,
                userId: req.user.id
            });
            
            await payment.save();
            
            return res.status(200).json({
                success: true,
                data: {
                    payment,
                    khaltiResponse: khaltiResponse
                }
            });
        }
        
        // For cash on delivery
        if (paymentMethod === 'cash_on_delivery') {
            // Create a payment record
            const payment = new Payment({
                order: orderId,
                amount: order.totalAmount,
                method: 'cash_on_delivery',
                status: 'pending',
                userId: req.user.id
            });
            
            await payment.save();
            
            return res.status(200).json({
                success: true,
                data: {
                    payment,
                    message: 'Cash on delivery selected. Pay when your order is delivered.'
                }
            });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed',
            error: error.message
        });
    }
};

// Verify payment status (New Khalti API)
exports.verifyPayment = async (req, res) => {
    try {
        const { pidx, orderId } = req.body;
        
        if (!pidx) {
            return res.status(400).json({
                success: false,
                message: 'Payment identifier (pidx) is required'
            });
        }
        
        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Verify with Khalti using new API
        const paymentVerification = await verifyPayment(pidx);
        
        // Find the payment record
        const payment = await Payment.findOne({ order: orderId, status: 'processing' });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }
        
        if (paymentVerification && paymentVerification.status === 'Completed') {
            // Update payment record
            payment.status = 'completed';
            payment.transactionId = paymentVerification.transaction_id || pidx;
            payment.completedAt = new Date();
            await payment.save();
            
            // Update order
            order.paymentStatus = 'completed';
            order.paymentDetails = {
                transactionId: paymentVerification.transaction_id || pidx,
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
            
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: { payment, order }
            });
        } else {
            // Mark payment as failed
            payment.status = 'failed';
            await payment.save();
            
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                status: paymentVerification.status
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// Handle Khalti callback (from frontend after payment)
exports.handleKhaltiCallback = async (req, res) => {
    try {
        const { pidx, txnId, amount, total_amount, status, mobile, purchase_order_id } = req.query;
        
        if (!pidx || !purchase_order_id) {
            return res.status(400).json({
                success: false,
                message: 'Required payment parameters missing'
            });
        }
        
        // Find the order
        const order = await Order.findById(purchase_order_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Verify the payment using lookup API
        const paymentVerification = await verifyPayment(pidx);
        
        if (paymentVerification && paymentVerification.status === 'Completed') {
            // Update payment and order status
            const payment = await Payment.findOne({ order: purchase_order_id, status: 'processing' });
            if (payment) {
                payment.status = 'completed';
                payment.transactionId = paymentVerification.transaction_id;
                payment.completedAt = new Date();
                await payment.save();
            }
            
            order.paymentStatus = 'completed';
            order.paymentDetails = {
                transactionId: paymentVerification.transaction_id,
                paymentDate: new Date()
            };
            
            if (order.status === 'pending') {
                order.status = 'confirmed';
                order.statusHistory.push({
                    status: 'confirmed',
                    timestamp: new Date(),
                    note: 'Order confirmed after payment'
                });
            }
            
            await order.save();
            
            // Send notification
            await sendNotification(
                order.user,
                `Your payment for order #${order._id} was successful!`,
                'payment',
                true
            );
            
            return res.status(200).json({
                success: true,
                message: 'Payment completed successfully',
                data: { order, payment }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                status: paymentVerification.status
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Payment callback processing failed',
            error: error.message
        });
    }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        let query = {};
        
        // Regular users can only see their own payments
        if (req.user.role !== 'admin') {
            query.userId = req.user.id;
        } 
        // Admin can see all payments or filter by userId
        else if (req.query.userId) {
            query.userId = req.query.userId;
        }
        
        const totalPayments = await Payment.countDocuments(query);
        
        const payments = await Payment.find(query)
            .populate({
                path: 'order',
                select: 'status createdAt totalAmount'
            })
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);
        
        res.json({
            success: true,
            count: payments.length,
            total: totalPayments,
            totalPages: Math.ceil(totalPayments / limit),
            currentPage: page,
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history',
            error: error.message
        });
    }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
    try {
        // Get total payments
        const totalPayments = await Payment.countDocuments();
        
        // Get total revenue
        const revenueStats = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;
        
        // Get payment method distribution
        const paymentMethods = await Payment.aggregate([
            { $group: { _id: '$method', count: { $sum: 1 } } },
            { $project: { method: '$_id', count: 1, _id: 0 } }
        ]);
        
        // Get monthly payment data for charts
        const monthlyPayments = await Payment.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } 
                } 
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Format monthly data for frontend charts
        const monthlyData = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = monthlyPayments.find(item => item._id === i);
            monthlyData.push({
                month: i,
                count: monthData ? monthData.count : 0,
                revenue: monthData ? monthData.revenue : 0
            });
        }
        
        // Get recent payments
        const recentPayments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'fullName email')
            .populate('order');
        
        res.status(200).json({
            success: true,
            data: {
                totalPayments,
                totalRevenue,
                paymentMethods,
                monthlyData,
                recentPayments
            }
        });
    } catch (error) {
        console.error('Error getting payment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment statistics',
            error: error.message
        });
    }
};