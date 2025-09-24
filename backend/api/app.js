const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRouters = require('./routers/userrouters');
const authRouters = require('../auth/authrouters');
const paymentRouters = require('./routers/paymentRouters');
const productRouters = require('./routers/productRouters');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../public/views'));

// Routes
app.use('/api/users', userRouters);
app.use('/api/auth', authRouters);
app.use('/api/payments', paymentRouters);
app.use('/api/products', productRouters);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/index.html'));
});

// Serve dashboard pages
app.get('/buffet-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/buffet-dashboard.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/admin-dashboard.html'));
});

// Payment result pages
app.get('/payment/success', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/payment-success.html'));
});

app.get('/payment/failure', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/payment-failure.html'));
});

app.get('/payment/pending', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/payment-pending.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '¡Algo salió mal!' });
});

module.exports = app;