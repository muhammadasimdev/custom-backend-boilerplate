// src/app.js
require('express-async-errors'); // Must be at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 1. Global Middlewares
app.use(helmet()); // Secure headers
app.use(cors()); // Allow React connections
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan('dev')); // Log requests to console

// this route is used for just testing 
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Custom Backend API! 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. Routes (We will hook these up later)
app.use('/api/v1/auth', require('./routes/auth.routes'));

app.use('/api/v1/auth', require('./routes/auth.routes'));
// Add the new protected routes here:
app.use('/api/v1/users', require('./routes/user.routes'));

// 3. Global Error Handler (Catches everything)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;