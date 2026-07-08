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
router.post('/', authorize('HR_MANAGER', 'SUPER_ADMIN', 'MANAGER'), performanceController.createReview);
router.get('/', authorize('HR_MANAGER', 'SUPER_ADMIN', 'MANAGER'), performanceController.getAllReviews);

// Goals
router.post('/goals', performanceController.createGoal);
router.get('/goals/my', performanceController.getMyGoals);
router.patch('/goals/:id', performanceController.updateGoalProgress);

// Peer Feedback
router.post('/feedback', performanceController.submitFeedback);

// AI Performance Draft
router.post('/ai-draft/:employeeId', authorize('HR_MANAGER', 'MANAGER', 'SUPER_ADMIN'), performanceController.generateAIDraft);

module.exports = router;
