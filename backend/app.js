// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = app;