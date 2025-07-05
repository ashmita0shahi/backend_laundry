const { body, validationResult } = require('express-validator');

// Auth validations
const validateSignup = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => validate(req, res, next)
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => validate(req, res, next)
];

const validateUpdateProfile = [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty'),
  (req, res, next) => validate(req, res, next)
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  (req, res, next) => validate(req, res, next)
];

// Order validations
const validateCreateOrder = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.service').notEmpty().withMessage('Service ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pickupAddress').isObject().withMessage('Pickup address is required'),
  body('pickupAddress.street').notEmpty().withMessage('Pickup street is required'),
  body('pickupAddress.city').notEmpty().withMessage('Pickup city is required'),
  body('deliveryAddress').isObject().withMessage('Delivery address is required'),
  body('deliveryAddress.street').notEmpty().withMessage('Delivery street is required'),
  body('deliveryAddress.city').notEmpty().withMessage('Delivery city is required'),
  body('pickupTime').isISO8601().withMessage('Valid pickup time is required'),
  body('deliveryTime').isISO8601().withMessage('Valid delivery time is required'),
  (req, res, next) => validate(req, res, next)
];

const validateUpdateOrderStatus = [
  body('status').isIn(['pending', 'confirmed', 'washing', 'drying', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('note').optional().notEmpty().withMessage('Note cannot be empty'),
  (req, res, next) => validate(req, res, next)
];

// Payment validations
const validatePayment = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('paymentMethod').isIn(['khalti', 'cash_on_delivery']).withMessage('Invalid payment method'),
  (req, res, next) => validate(req, res, next)
];

const validateVerifyPayment = [
  body('pidx').notEmpty().withMessage('Payment identifier (pidx) is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  (req, res, next) => validate(req, res, next)
];

// Service validations
const validateService = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['washing', 'dry_cleaning', 'ironing', 'specialized']).withMessage('Invalid category'),
  body('estimatedDuration').notEmpty().withMessage('Estimated duration is required'),
  body('items').isArray({ min: 1 }).withMessage('Items must be an array with at least one item'),
  body('items.*.name').notEmpty().withMessage('Item name is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  (req, res, next) => validate(req, res, next)
];

const validateUpdateService = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['washing', 'dry_cleaning', 'ironing', 'specialized']).withMessage('Invalid category'),
  body('estimatedDuration').optional().notEmpty().withMessage('Estimated duration cannot be empty'),
  body('items').optional().isArray({ min: 1 }).withMessage('Items must be an array with at least one item'),
  body('items.*.name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('items.*.price').optional().isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  (req, res, next) => validate(req, res, next)
];

// Common validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateOrder,
  validateUpdateOrderStatus,
  validatePayment,
  validateVerifyPayment,
  validateService,
  validateUpdateService
};