const Payroll = require('./payroll.model');
const Employee = require('../hr/employee.model');
const aiPayroll = require('../ai/ai.payroll');
const Attendance = require('./attendance.model');

// @desc    Generate payroll (Manual Trigger for Phase 1)
// @route   POST /api/v1/time-payroll/payroll/generate
// @access  Private (FINANCE, SUPER_ADMIN)
exports.generatePayroll = async (req, res) => {
    try {
        const { employeeId, payPeriod } = req.body; // payPeriod format: "YYYY-MM"
        
        if (!employeeId || !payPeriod) {
            return res.status(400).json({ success: false, message: 'Employee ID and pay period are required' });
        }

        // Check if payroll already exists
        const existing = await Payroll.findOne({ employeeId, payPeriod });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Payroll already generated for this period' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        // Retrieve attendance for this period to calculate overtime
        // Start of month: "YYYY-MM-01", end of month: "YYYY-MM-31" roughly.
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $regex: `^${payPeriod}` }
        });

        let totalOvertimeHours = 0;
        attendanceRecords.forEach(record => {
            totalOvertimeHours += record.overtime;
        });

        // Basic calculation logic for MVP
        const basicSalary = employee.salary;
        const hra = basicSalary * 0.2; // 20% HRA
        const overtimeRate = (basicSalary / 30 / 8) * 1.5; // 1.5x hourly rate for overtime
        const overtimePay = totalOvertimeHours * overtimeRate;
        const deductions = 0; // Keeping simple for now
        
        const netSalary = basicSalary + hra + overtimePay - deductions;

        const payroll = await Payroll.create({
            employeeId,
            payPeriod,
            basicSalary,
            hra,
            overtimePay,
            deductions,
            netSalary,
            status: 'Draft'
        });

        res.status(201).json({ success: true, data: payroll, message: 'Payroll generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my payslips
// @route   GET /api/v1/time-payroll/payroll/my
// @access  Private
exports.getMyPayslips = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const payslips = await Payroll.find({ employeeId }).sort({ payPeriod: -1 });
        res.status(200).json({ success: true, count: payslips.length, data: payslips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payrolls
// @route   GET /api/v1/time-payroll/payroll/all
// @access  Private (FINANCE, SUPER_ADMIN)
exports.getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find()
            .populate('employeeId', 'name employeeId department designation')
            .sort({ payPeriod: -1, createdAt: -1 });
            
        res.status(200).json({ success: true, count: payrolls.length, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update payroll status
// @route   PUT /api/v1/time-payroll/payroll/:id/status
// @access  Private (FINANCE, SUPER_ADMIN)
exports.updatePayrollStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Draft', 'Reviewed', 'Approved', 'Paid'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('employeeId', 'name employeeId department designation');

        if (!payroll) {
            return res.status(404).json({ success: false, message: 'Payroll record not found' });
        }

        res.status(200).json({ success: true, data: payroll, message: `Payroll status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Run AI Audit on recent payrolls
// @route   POST /api/v1/time-payroll/payroll/ai-audit
// @access  Private (FINANCE, ADMIN)
exports.runAIAudit = async (req, res) => {
    try {
        const payrolls = await Payroll.find()
            .populate('employeeId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        if (!payrolls || payrolls.length === 0) {
            return res.status(404).json({ success: false, message: 'No payrolls to analyze' });
        }

        const aiAnalysis = await aiPayroll.detectPayrollAnomalies(payrolls);
        res.status(200).json({ success: true, data: aiAnalysis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
