const express = require('express');
const ProductController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../../auth/middleware');

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.post('/', authenticateToken, authorizeRole(['admin', 'buffet']), ProductController.createProduct);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'buffet']), ProductController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'buffet']), ProductController.deleteProduct);
router.get('/sales-stats', authenticateToken, authorizeRole(['buffet', 'admin']), ProductController.getSalesStats);
router.post('/record-sale', ProductController.recordSale);
router.get('/orders', authenticateToken, authorizeRole(['buffet', 'admin']), ProductController.getOrders);

module.exports = router;