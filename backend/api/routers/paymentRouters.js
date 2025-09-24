const express = require('express');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-preference', PaymentController.createPreference);
router.post('/webhook', PaymentController.webhook);
router.get('/status/:paymentId', PaymentController.getPaymentStatus);
router.post('/create-test-order', PaymentController.createTestOrder);

module.exports = router;