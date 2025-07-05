const Service = require('../models/Service');

// Fetch all available laundry services
exports.getAllServices = async (req, res) => {
    try {
        // Filter by category if provided
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        // Filter by active status
        if (req.query.active === 'true') {
            filter.isActive = true;
        }
        
        const services = await Service.find(filter);
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch a single service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new laundry service (admin only)
exports.createService = async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can create services'
            });
        }
        
        const { name, description, category, items, estimatedDuration, icon } = req.body;
        
        // Validate required fields
        if (!name || !description || !category || !items || !estimatedDuration) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, category, items, estimatedDuration'
            });
        }
        
        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items must be an array with at least one item'
            });
        }
        
        // Check that all items have name and price
        for (const item of items) {
            if (!item.name || typeof item.price !== 'number' || item.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have a name and a valid price'
                });
            }
        }
        
        const newService = new Service({
            name,
            description,
            category,
            items,
            estimatedDuration,
            icon: icon || 'default_icon.png'
        });
        
        await newService.save();
        
        res.status(201).json({
            success: true,
            data: newService
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an existing laundry service (admin only)
exports.updateService = async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update services'
            });
        }
        
        const { name, description, category, items, estimatedDuration, icon, isActive } = req.body;
        
        // Prepare update object
        const updateData = {
            updatedAt: new Date()
        };
        
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (icon) updateData.icon = icon;
        if (estimatedDuration) updateData.estimatedDuration = estimatedDuration;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        
        // If items are provided, validate them
        if (items) {
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Items must be an array with at least one item'
                });
            }
            
            // Check that all items have name and price
            for (const item of items) {
                if (!item.name || typeof item.price !== 'number' || item.price < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each item must have a name and a valid price'
                    });
                }
            }
            
            updateData.items = items;
        }
        
        const service = await Service.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error', 
            error: error.message
        });
    }
};

// Delete a laundry service (admin only)
exports.deleteService = async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete services'
            });
        }
        
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        // Instead of deleting, mark as inactive
        service.isActive = false;
        service.updatedAt = new Date();
        await service.save();
        
        res.status(200).json({
            success: true,
            message: 'Service deactivated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error', 
            error: error.message
        });
    }
};

// Get items by service (for frontend display)
exports.getServiceItems = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        
        if (!service.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This service is currently unavailable'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                serviceName: service.name,
                serviceId: service._id,
                items: service.items
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error', 
            error: error.message
        });
    }
};