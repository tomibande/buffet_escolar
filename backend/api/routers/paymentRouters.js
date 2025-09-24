const express = require('express');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-pending-order', PaymentController.createPendingOrder);
router.post('/confirm-payment/:orderId', PaymentController.confirmPayment);

module.exports = router;