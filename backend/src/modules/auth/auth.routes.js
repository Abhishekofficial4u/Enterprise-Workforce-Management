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

// TEMPORARY: Seed Endpoint for Live Testing
const seedDemoData = require('../../scripts/seedDemoData');
router.post('/seed-demo', async (req, res) => {
    try {
        const credentials = await seedDemoData();
        res.status(200).json({ success: true, message: 'Demo data seeded!', credentials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/admin/credentials-vault', protect, authorize('SUPER_ADMIN'), authController.getCredentialsVault);
router.post('/admin/impersonate/:userId', protect, authorize('SUPER_ADMIN'), auditLog('IMPERSONATE_USER', 'USERS'), authController.impersonateUser);

module.exports = router;
