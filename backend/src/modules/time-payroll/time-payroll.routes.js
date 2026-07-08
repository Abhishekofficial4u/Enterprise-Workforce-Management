const express = require('express');
const router = express.Router();

const attendanceController = require('./attendance.controller');
const leaveController = require('./leave.controller');
const payrollController = require('./payroll.controller');
const shiftController = require('./shift.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

// Protect all time-payroll routes
router.use(protect);

// ---- ATTENDANCE ROUTES ----
router.post('/attendance/clock-in', attendanceController.clockIn);
router.post('/attendance/clock-out', attendanceController.clockOut);
router.get('/attendance/my', attendanceController.getMyAttendance);
router.get('/attendance/daily', authorize('HR_MANAGER', 'SUPER_ADMIN', 'MANAGER'), attendanceController.getAllAttendance);

// ---- LEAVE ROUTES ----
router.post('/leave', authorize('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'SUPER_ADMIN'), leaveController.applyLeave);
router.get('/leave/balance', authorize('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), leaveController.getMyLeaveBalance);
router.get('/leave/my', leaveController.getMyLeaves);
router.get('/leave/all', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN'), leaveController.getAllLeaves);
router.patch('/leave/:id/status', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), leaveController.updateLeaveStatus);
router.get('/leave/:id/ai-prediction', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), leaveController.predictLeave);

// ---- PAYROLL ROUTES ----
router.post('/payroll/generate', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.generatePayroll);
router.get('/payroll/my', payrollController.getMyPayslips);
router.get('/payroll/all', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.getAllPayrolls);
router.put('/payroll/:id/status', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER'), payrollController.updatePayrollStatus);
router.post('/payroll/ai-audit', authorize('FINANCE', 'SUPER_ADMIN', 'HR_MANAGER', 'ORG_ADMIN'), payrollController.runAIAudit);

// ---- SHIFT SCHEDULING ROUTES ----
router.get('/shifts', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), shiftController.getShifts);
router.post('/shifts', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), shiftController.createShift);
router.delete('/shifts/:id', authorize('MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), shiftController.deleteShift);

module.exports = router;
