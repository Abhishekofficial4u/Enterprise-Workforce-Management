const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Public Routes
router.get('/test-email', authController.testEmailRoute);
router.get('/seed-roles', authController.seedRolesRoute);
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

router.post('/admin/credentials-vault', protect, authorize('SUPER_ADMIN'), authController.getCredentialsVault);
router.post('/admin/impersonate/:userId', protect, authorize('SUPER_ADMIN'), authController.impersonateUser);

module.exports = router;
