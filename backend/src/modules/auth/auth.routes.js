const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Public Routes
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin);

router.post('/admin/credentials-vault', protect, authorize('SUPER_ADMIN'), authController.getCredentialsVault);
router.post('/admin/impersonate/:userId', protect, authorize('SUPER_ADMIN'), authController.impersonateUser);

module.exports = router;
