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

router.route('/employees/:id')
    .delete(authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), employeeController.archiveEmployee);

module.exports = router;
