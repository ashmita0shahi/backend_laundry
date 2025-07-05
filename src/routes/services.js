const express = require('express');
const router = express.Router();
const { 
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServiceItems
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { validateService, validateUpdateService } = require('../middleware/validate');

// @desc    Get all laundry services
// @route   GET /api/services
// @access  Public
router.get('/', getAllServices);

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', getServiceById);

// @desc    Get items for a service
// @route   GET /api/services/:id/items
// @access  Public
router.get('/:id/items', getServiceItems);

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, authorize('admin'), validateService, createService);

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), validateUpdateService, updateService);

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;