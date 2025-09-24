const express = require('express');
const PaymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-preference', PaymentController.createPreference);
router.post('/webhook', PaymentController.webhook);
router.post('/create-test-order', PaymentController.createTestOrder);
router.post('/simulate-payment', PaymentController.simulatePayment);

module.exports = router;