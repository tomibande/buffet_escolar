const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../../auth/middleware');

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.post('/', authenticateToken, authorizeRole(['admin']), ProductController.createProduct);
router.put('/:id', authenticateToken, authorizeRole(['admin']), ProductController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), ProductController.deleteProduct);
router.get('/sales-stats', authenticateToken, authorizeRole(['buffet', 'admin']), ProductController.getSalesStats);
router.post('/record-sale', ProductController.recordSale);

module.exports = router;