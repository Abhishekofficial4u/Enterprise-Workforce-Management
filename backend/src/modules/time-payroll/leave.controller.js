const Leave = require('./leave.model');

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

        leave.status = status;
        leave.approvedBy = req.user.employeeId;
        await leave.save();

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
