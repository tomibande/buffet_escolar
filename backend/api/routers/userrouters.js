const express = require('express');
const UserController = require('../controllers/userController');
const UserProductController = require('../controllers/userProduct');
const { authenticateToken } = require('../../auth/middleware');

const router = express.Router();

// User routes
router.get('/', authenticateToken, UserController.getAllUsers);
router.get('/:id', authenticateToken, UserController.getUserById);
router.put('/:id', authenticateToken, UserController.updateUser);
router.delete('/:id', authenticateToken, UserController.deleteUser);

// User product routes
router.get('/:userId/products', authenticateToken, UserProductController.getUserProducts);
router.post('/:userId/products', authenticateToken, UserProductController.addProductToUser);
router.delete('/:userId/products/:productId', authenticateToken, UserProductController.removeProductFromUser);

module.exports = router;