const express = require('express');
const router = express.Router();

const attendanceController = require('./attendance.controller');
const leaveController = require('./leave.controller');
const payrollController = require('./payroll.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

// Protect all time-payroll routes
router.use(protect);

// ---- ATTENDANCE ROUTES ----
router.post('/attendance/clock-in', attendanceController.clockIn);
router.post('/attendance/clock-out', attendanceController.clockOut);
router.get('/attendance/my', attendanceController.getMyAttendance);
router.get('/attendance/daily', authorize('HR_MANAGER', 'SUPER_ADMIN'), attendanceController.getAllAttendance);

// ---- LEAVE ROUTES ----
router.post('/leave', leaveController.applyLeave);
router.get('/leave/my', leaveController.getMyLeaves);
router.get('/leave/all', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN'), leaveController.getAllLeaves);
router.put('/leave/:id', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN'), leaveController.updateLeaveStatus);

// ---- PAYROLL ROUTES ----
router.post('/payroll/generate', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.generatePayroll);
router.get('/payroll/my', payrollController.getMyPayslips);
router.get('/payroll/all', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.getAllPayrolls);
router.put('/payroll/:id/status', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.updatePayrollStatus);

module.exports = router;
