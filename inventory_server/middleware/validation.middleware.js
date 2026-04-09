const { body, validationResult } = require('express-validator');

// Validation rules for product
exports.validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('inStock').optional().isBoolean().withMessage('inStock must be a boolean'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
};
