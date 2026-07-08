const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const cache = require('../../middlewares/cache.middleware');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE', 'MANAGER'));

router.get('/dashboard', cache(300), reportController.getDashboardStats);
router.post('/ai-summary', reportController.getAiSummary);

module.exports = router;
