const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Public Routes
router.post('/login', authController.login);
router.post('/setup-admin', authController.registerAdmin); // Should be removed or protected in production

module.exports = router;
