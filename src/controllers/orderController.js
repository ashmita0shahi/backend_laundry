const Order = require('../models/Order');
const { geocodeAddress } = require('../utils/geocoder');
const { sendNotification } = require('../utils/notificationService');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { items, pickupLocation, specialInstructions } = req.body;
        
        // Calculate total amount
        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // Get coordinates from pickup location
        let coordinates = [0, 0];
        try {
            const geocodeResult = await geocodeAddress(pickupLocation);
            if (geocodeResult && geocodeResult.length > 0) {
                coordinates = [geocodeResult[0].longitude, geocodeResult[0].latitude];
            }
        } catch (geoError) {
            console.error('Geocoding error:', geoError);
            // Continue with default coordinates if geocoding fails
        }

        const order = new Order({
            user: req.user.id,
            items,
            pickupLocation,
            pickupCoordinates: {
                type: 'Point',
                coordinates
            },
            status: 'pending',
            statusHistory: [
                { status: 'pending', timestamp: new Date(), note: 'Order placed' }
            ],
            totalAmount,
            specialInstructions
        });

        await order.save();

        // Send notification to user
        await sendNotification(
            req.user.id,
            `Your order #${order._id} has been placed successfully. We'll confirm it shortly.`,
            'order_confirmed',
            true
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullName email phoneNumber')
            .populate('items.service', 'name description');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if the user is authorized to view this order
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this order' });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'washing', 'drying', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        // Only admin can update order status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update order status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Update status
        order.status = status;
        order.updatedAt = new Date();
        
        // Add to status history
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status}`
        });
        
        await order.save();
        
        // Send notification to user
        const notificationMessages = {
            confirmed: `Your order #${order._id} has been confirmed and will be picked up soon.`,
            washing: `Your clothes from order #${order._id} are now being washed.`,
            drying: `Your clothes from order #${order._id} are now being dried.`,
            out_for_delivery: `Your order #${order._id} is out for delivery and will arrive soon.`,
            delivered: `Your order #${order._id} has been delivered. Thank you for using LaundryEase!`,
            cancelled: `Your order #${order._id} has been cancelled. Please contact support for details.`
        };
        
        if (notificationMessages[status]) {
            await sendNotification(
                order.user,
                notificationMessages[status],
                status === 'cancelled' ? 'payment' : status,
                true
            );
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Get order history for a user
exports.getOrderHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        let query = {};
        
        // Regular users can only see their own orders
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        } 
        // Admin can see all orders or filter by userId
        else if (req.query.userId) {
            query.user = req.query.userId;
        }
        
        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        const totalOrders = await Order.countDocuments(query);
        
        const orders = await Order.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('items.service', 'name description')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);
        
        res.json({
            success: true,
            count: orders.length,
            total: totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching order history', error: error.message });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        // Only admin can access all orders
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access all orders' });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        let query = {};
        
        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        const totalOrders = await Order.countDocuments(query);
        
        const orders = await Order.find(query)
            .populate('user', 'fullName email phoneNumber')
            .populate('items.service', 'name description')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);
        
        res.json({
            success: true,
            count: orders.length,
            total: totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// Get dashboard statistics (admin only)
exports.getDashboardStats = async (req, res) => {
    try {
        // Only admin can access dashboard stats
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access dashboard statistics' });
        }

        // Get today's date and start of the month
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Total orders
        const totalOrders = await Order.countDocuments();
        
        // Today's orders
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: startOfToday }
        });
        
        // Month's orders
        const monthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        
        // Orders by status
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
        const washingOrders = await Order.countDocuments({ status: 'washing' });
        const dryingOrders = await Order.countDocuments({ status: 'drying' });
        const outForDeliveryOrders = await Order.countDocuments({ status: 'out_for_delivery' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
        
        // Revenue stats
        const allCompletedOrders = await Order.find({ 
            status: 'delivered',
            paymentStatus: 'completed'
        });
        
        const totalRevenue = allCompletedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        const todayRevenue = allCompletedOrders
            .filter(order => order.updatedAt >= startOfToday)
            .reduce((sum, order) => sum + order.totalAmount, 0);
            
        const monthRevenue = allCompletedOrders
            .filter(order => order.updatedAt >= startOfMonth)
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.json({
            success: true,
            data: {
                orderCounts: {
                    total: totalOrders,
                    today: todayOrders,
                    month: monthOrders
                },
                orderStatus: {
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    washing: washingOrders,
                    drying: dryingOrders,
                    outForDelivery: outForDeliveryOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue,
                    month: monthRevenue
                },
                recentOrders
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};