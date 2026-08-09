const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

// Common validation rules
const validations = {
  // Product validation
  createProduct: [
    body('name').trim().isLength({ min: 1, max: 200 }).escape().withMessage('Product name is required'),
    body('description').trim().isLength({ max: 5000 }).escape().withMessage('Description too long'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').isMongoId().withMessage('Invalid category ID'),
    body('brand').isMongoId().withMessage('Invalid brand ID'),
    validate,
  ],

  // Category validation
  createCategory: [
    body('name').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Category name is required'),
    body('description').optional().trim().isLength({ max: 500 }).escape(),
    validate,
  ],

  // Brand validation
  createBrand: [
    body('name').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Brand name is required'),
    body('description').optional().trim().isLength({ max: 500 }).escape(),
    validate,
  ],

  // Order validation
  createOrder: [
    body('shippingInfo.name').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Name is required'),
    body('shippingInfo.phone').trim().isLength({ min: 10, max: 20 }).withMessage('Valid phone number required'),
    body('shippingInfo.address').trim().isLength({ min: 5, max: 500 }).escape().withMessage('Address is required'),
    body('shippingInfo.city').trim().isLength({ min: 2, max: 100 }).escape().withMessage('City is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.product').isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Invalid quantity'),
    validate,
  ],

  // Coupon validation
  createCoupon: [
    body('code').trim().isLength({ min: 3, max: 20 }).toUpperCase().withMessage('Coupon code is required'),
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('minPurchase').optional().isFloat({ min: 0 }),
    validate,
  ],

  // Banner validation
  createBanner: [
    body('title').trim().isLength({ min: 1, max: 200 }).escape().withMessage('Banner title is required'),
    body('subtitle').optional().trim().isLength({ max: 300 }).escape(),
    body('position').isIn(['hero', 'promo', 'sidebar']).withMessage('Invalid position'),
    validate,
  ],

  // Review validation
  createReview: [
    body('product').isMongoId().withMessage('Invalid product ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('title').optional().trim().isLength({ max: 100 }).escape(),
    body('comment').trim().isLength({ min: 1, max: 1000 }).escape().withMessage('Comment is required'),
    validate,
  ],

  // User update validation
  updateUser: [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).escape(),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
    validate,
  ],

  // MongoDB ID parameter validation
  mongoIdParam: [
    param('id').isMongoId().withMessage('Invalid ID format'),
    validate,
  ],

  // Search query validation
  search: [
    query('q').optional().trim().isLength({ max: 200 }).escape(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validate,
  ],
};

module.exports = { validate, validations };
