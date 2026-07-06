const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('SUPER_ADMIN')); // Only Super Admins can view analytics

router.get('/dashboard', reportController.getDashboardStats);

module.exports = router;
