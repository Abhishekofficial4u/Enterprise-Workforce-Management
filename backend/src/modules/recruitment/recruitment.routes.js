const express = require('express');
const router = express.Router();
const recruitmentController = require('./recruitment.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(protect);

// Only HR_MANAGER and SUPER_ADMIN can access ATS
router.use(authorize('HR_MANAGER', 'SUPER_ADMIN'));

// Job Routes
router.post('/jobs', recruitmentController.createJob);
router.get('/jobs', recruitmentController.getJobs);
router.patch('/jobs/:id/status', recruitmentController.updateJobStatus);

// Candidate Routes
router.post('/candidates', recruitmentController.createCandidate);
router.get('/jobs/:jobId/candidates', recruitmentController.getCandidatesByJob);
router.patch('/candidates/:id/stage', recruitmentController.updateCandidateStage);

module.exports = router;
