const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Protect all routes
router.use(protect);

// Routes
router.route('/employees')
    .get(employeeController.getEmployees)
    .post(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), employeeController.createEmployee);

router.route('/employees/me')
    .get(employeeController.getMyProfile)
    .put(employeeController.updateMyProfile);

router.route('/employees/:id')
    .put(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), employeeController.updateEmployee)
    .delete(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), employeeController.archiveEmployee);

router.route('/employees/:id/permanent')
    .delete(authorize('SUPER_ADMIN'), employeeController.deleteEmployee);

module.exports = router;
