const express = require('express');
const router = express.Router();
const performanceController = require('./performance.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(protect);

// Employee routes
router.get('/my', performanceController.getMyReviews);
router.patch('/:id/acknowledge', performanceController.acknowledgeReview);

// Manager / Admin routes
router.post('/', authorize('HR_MANAGER', 'SUPER_ADMIN'), performanceController.createReview);
router.get('/', authorize('HR_MANAGER', 'SUPER_ADMIN'), performanceController.getAllReviews);

module.exports = router;
