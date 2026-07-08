const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const auditLog = require('../../middlewares/audit.middleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login requests per windowMs
    message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Public Routes
router.get('/test-email', authController.testEmailRoute);
router.get('/seed-roles', authController.seedRolesRoute);
router.get('/create-test-users', authController.createTestUsersRoute);
router.post('/login', loginLimiter, authController.login);
router.post('/register-admin', authController.registerAdmin);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

router.post('/admin/credentials-vault', protect, authorize('SUPER_ADMIN'), authController.getCredentialsVault);
router.post('/admin/impersonate/:userId', protect, authorize('SUPER_ADMIN'), auditLog('IMPERSONATE_USER', 'USERS'), authController.impersonateUser);

module.exports = router;
