const express = require('express');
const router = express.Router();
const recruitmentController = require('./recruitment.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// =======================
// PUBLIC ROUTES (Careers Page)
// =======================
router.get('/jobs', recruitmentController.getJobs);
router.post('/candidates', recruitmentController.createCandidate);

// =======================
// PROTECTED ATS ROUTES (HR & Admin Only)
// =======================
router.use(protect);
router.use(authorize('HR_MANAGER', 'SUPER_ADMIN'));

router.post('/jobs', recruitmentController.createJob);
router.patch('/jobs/:id/status', recruitmentController.updateJobStatus);

router.get('/jobs/:jobId/candidates', recruitmentController.getCandidatesByJob);
router.put('/candidates/:id/stage', recruitmentController.updateCandidateStage);
router.post('/candidates/:id/ai-screen', recruitmentController.aiScreenCandidate);

module.exports = router;
