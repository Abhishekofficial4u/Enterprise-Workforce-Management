const Leave = require('./leave.model');
const sendEmail = require('../../utils/emailService');
const Employee = require('../hr/employee.model');
const aiLeave = require('../ai/ai.leave');

// @desc    Apply for leave
// @route   POST /api/v1/time-payroll/leave
// @access  Private (EMPLOYEE)
exports.applyLeave = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const { leaveType, startDate, endDate, reason } = req.body;
        
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
        }

        const Employee = require('../hr/employee.model');
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end

        // Map leaveType to balance field
        let balanceField = null;
        if (leaveType === 'Casual Leave') balanceField = 'casual';
        else if (leaveType === 'Sick Leave') balanceField = 'sick';
        else if (leaveType === 'Earned Leave') balanceField = 'earned';

        if (balanceField) {
            if (employee.leaveBalance[balanceField] < diffDays) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient ${leaveType} balance. You requested ${diffDays} days but only have ${employee.leaveBalance[balanceField]} left.` 
                });
            }
            // Deduct balance
            employee.leaveBalance[balanceField] -= diffDays;
            await employee.save();
        }

        const leave = await Leave.create({
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason
        });

        res.status(201).json({ success: true, data: leave, message: 'Leave application submitted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/v1/time-payroll/leave/:id
// @access  Private (MANAGER, HR_MANAGER)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body; // Approved, Rejected
        
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

        // Refund balance if rejected or cancelled, and it wasn't already rejected/cancelled
        if ((status === 'Rejected' || status === 'Cancelled') && leave.status !== 'Rejected' && leave.status !== 'Cancelled') {
            const Employee = require('../hr/employee.model');
            const employee = await Employee.findById(leave.employeeId);
            
            if (employee) {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                
                let balanceField = null;
                if (leave.leaveType === 'Casual Leave') balanceField = 'casual';
                else if (leave.leaveType === 'Sick Leave') balanceField = 'sick';
                else if (leave.leaveType === 'Earned Leave') balanceField = 'earned';

                if (balanceField) {
                    employee.leaveBalance[balanceField] += diffDays;
                    await employee.save();
                }
            }
        }

        leave.status = status;
        leave.approvedBy = req.user.employeeId;
        await leave.save();

        // Send Email Notification
        try {
            const Employee = require('../hr/employee.model');
            const employeeForEmail = await Employee.findById(leave.employeeId);
            
            if (employeeForEmail && employeeForEmail.email) {
                const message = status === 'Approved' 
                    ? `Great news! Your ${leave.leaveType} request for ${leave.startDate.split('T')[0]} to ${leave.endDate.split('T')[0]} has been APPROVED.`
                    : `Your ${leave.leaveType} request for ${leave.startDate.split('T')[0]} to ${leave.endDate.split('T')[0]} has been ${status.toUpperCase()}.`;

                // Emit Real-time Notification
                const User = require('../auth/user.model');
                const user = await User.findOne({ email: employeeForEmail.email });
                if (user) {
                    const { createNotification } = require('../notifications/notification.controller');
                    await createNotification(
                        user._id,
                        `Leave Request ${status}`,
                        message,
                        'Leave'
                    );
                }

                sendEmail({
                    email: employeeForEmail.email,
                    subject: `Leave Request ${status} - Enterprise Workforce`,
                    message: message,
                    html: `<h3>Leave Request ${status}</h3><p>${message}</p>`
                }).catch(emailErr => {
                    console.error('Leave email failed to send:', emailErr);
                });
            }
        } catch (emailErr) {
            console.error('Leave email failed to send:', emailErr);
        }

        res.status(200).json({ success: true, data: leave, message: `Leave ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my leaves
// @route   GET /api/v1/time-payroll/leave/my
// @access  Private
exports.getMyLeaves = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const leaves = await Leave.find({ employeeId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all leaves
// @route   GET /api/v1/time-payroll/leave/all
// @access  Private (MANAGER, HR_MANAGER, SUPER_ADMIN)
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employeeId', 'name employeeId department designation')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my leave balances
// @route   GET /api/v1/time-payroll/leave/balance
// @access  Private
exports.getMyLeaveBalance = async (req, res) => {
    try {
        const Employee = require('../hr/employee.model');
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        res.status(200).json({ 
            success: true, 
            data: employee.leaveBalance || { casual: 0, sick: 0, earned: 0 } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Predict Leave Approval using AI
// @route   GET /api/v1/time-payroll/leave/:id/ai-prediction
// @access  Private (MANAGER, HR)
exports.predictLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId', 'department name');
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

        const isOwner = leave.employeeId._id.toString() === req.user.employeeId?.toString();
        const isAdminRole = req.user.roles.some(r => ['MANAGER', 'HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'].includes(r.name));
        
        if (!isOwner && !isAdminRole) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this prediction' });
        }

        const employee = await Employee.findById(leave.employeeId._id);
        
        // Mock team stats for now
        const teamStats = { totalMembers: 12, onLeave: 2 };
        
        const empStats = { 
            sickTaken: employee.leaveBalance?.sick ? (10 - employee.leaveBalance.sick) : 0 
        };

        const duration = (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24) + 1;

        const aiPrediction = await aiLeave.predictLeaveApproval({
            leaveType: leave.leaveType,
            duration: duration,
            reason: leave.reason
        }, empStats, teamStats);

        res.status(200).json({ success: true, data: aiPrediction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Predict Leave Approval for a new request (before submitting)
// @route   POST /api/v1/time-payroll/leave/ai-prediction
// @access  Private (EMPLOYEE, MANAGER, HR)
exports.predictNewLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const Employee = require('../hr/employee.model');
        const employee = await Employee.findById(employeeId);
        
        // Mock team stats for now
        const teamStats = { totalMembers: 12, onLeave: 2 };
        
        const empStats = { 
            sickTaken: employee.leaveBalance?.sick ? (10 - employee.leaveBalance.sick) : 0 
        };

        const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;

        const aiPrediction = await aiLeave.predictLeaveApproval({
            leaveType,
            duration: duration || 1,
            reason: reason || 'Not specified'
        }, empStats, teamStats);

        res.status(200).json({ success: true, data: aiPrediction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
