const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const documentController = require('./document.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const auditLog = require('../../middlewares/audit.middleware');
const cache = require('../../middlewares/cache.middleware');
const { clearCache } = require('../../middlewares/cache.middleware');
const onboardingController = require('./onboarding.controller');
const trainingController = require('./training.controller');

// Protect all routes
router.use(protect);

// Routes
router.route('/employees')
    .get(cache(60), employeeController.getEmployees)
    .post(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), auditLog('CREATE_EMPLOYEE', 'EMPLOYEES'), employeeController.createEmployee);

router.route('/employees/me')
    .get(employeeController.getMyProfile)
    .put(employeeController.updateMyProfile);

router.route('/employees/:id')
    .put(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), auditLog('UPDATE_EMPLOYEE', 'EMPLOYEES'), employeeController.updateEmployee)
    .delete(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), auditLog('ARCHIVE_EMPLOYEE', 'EMPLOYEES'), employeeController.archiveEmployee);

router.route('/employees/:id/permanent')
    .delete(authorize('SUPER_ADMIN'), auditLog('DELETE_EMPLOYEE', 'EMPLOYEES'), employeeController.deleteEmployee);

const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Documents
router.route('/employees/:employeeId/documents')
    .get(protect, documentController.getDocumentsByEmployee)
    .post(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE'), upload.single('file'), auditLog('ADD_DOCUMENT', 'DOCUMENTS'), documentController.addDocument);

router.route('/documents/:id')
    .delete(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), auditLog('DELETE_DOCUMENT', 'DOCUMENTS'), documentController.deleteDocument);

// --- Onboarding Routes ---
router.get('/employees/:employeeId/onboarding', onboardingController.getOnboardingTasks);
router.post('/employees/:employeeId/onboarding', authorize('HR_MANAGER', 'SUPER_ADMIN'), onboardingController.createOnboardingTask);
router.post('/employees/:employeeId/onboarding/generate', authorize('HR_MANAGER', 'SUPER_ADMIN'), onboardingController.generateStandardChecklist);
router.put('/onboarding/:taskId', onboardingController.updateOnboardingTask);
router.delete('/onboarding/:taskId', authorize('HR_MANAGER', 'SUPER_ADMIN'), onboardingController.deleteOnboardingTask);

// --- Training & L&D Routes (HR) ---
router.route('/training')
    .get(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), trainingController.getTrainingPrograms)
    .post(authorize('HR_MANAGER', 'SUPER_ADMIN'), trainingController.createTrainingProgram);

router.route('/training/:id')
    .put(authorize('HR_MANAGER', 'SUPER_ADMIN'), trainingController.updateTrainingProgram)
    .delete(authorize('HR_MANAGER', 'SUPER_ADMIN'), trainingController.deleteTrainingProgram);

router.post('/training/enroll', authorize('HR_MANAGER', 'SUPER_ADMIN'), trainingController.enrollEmployee);
router.get('/training/:id/enrollments', authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), trainingController.getProgramEnrollments);

// --- Employee Learning Portal Routes ---
router.get('/employees/me/learning', trainingController.getMyLearning);
router.put('/learning/enrollments/:id', trainingController.updateEnrollmentStatus);

module.exports = router;
