const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const userRouters = require('./routers/userrouters');
const authRouters = require('../auth/authrouters');

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

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;