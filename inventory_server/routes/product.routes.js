const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateProduct, handleValidationErrors } = require('../middleware/validation.middleware');

// Create a new product
router.post('/', validateProduct, handleValidationErrors, productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get a single product
router.get('/:id', productController.getProductById);

// Update a product
router.put('/:id', validateProduct, handleValidationErrors, productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
