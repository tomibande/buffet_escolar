const express = require('express');
const AuthController = require('./authcontroller');

const router = express.Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Render pages
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;