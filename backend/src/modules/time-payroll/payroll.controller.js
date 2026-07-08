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
        
        // Detailed Deductions
        const providentFund = basicSalary * 0.05; // 5% PF
        const healthInsurance = 50; // Flat $50
        const taxableIncome = basicSalary + hra + overtimePay - providentFund;
        
        // Simple progressive income tax
        let incomeTax = 0;
        if (taxableIncome > 5000) {
            incomeTax = (taxableIncome - 5000) * 0.20 + (5000 * 0.10);
        } else {
            incomeTax = taxableIncome * 0.10;
        }

        const totalDeductions = providentFund + healthInsurance + incomeTax;
        
        const netSalary = basicSalary + hra + overtimePay - totalDeductions;

        const payroll = await Payroll.create({
            employeeId,
            payPeriod,
            basicSalary,
            hra,
            overtimePay,
            deductions: totalDeductions,
            deductionsBreakdown: {
                incomeTax,
                providentFund,
                healthInsurance
            },
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

// @desc    Batch generate payroll for all active employees
// @route   POST /api/v1/time-payroll/payroll/batch-generate
// @access  Private (FINANCE, SUPER_ADMIN)
exports.batchGeneratePayroll = async (req, res) => {
    try {
        const { payPeriod } = req.body;
        if (!payPeriod) return res.status(400).json({ success: false, message: 'Pay period is required' });

        const employees = await Employee.find({ status: 'Active' });
        let generatedCount = 0;

        for (const employee of employees) {
            const existing = await Payroll.findOne({ employeeId: employee._id, payPeriod });
            if (existing) continue;

            const attendanceRecords = await Attendance.find({
                employeeId: employee._id,
                date: { $regex: `^${payPeriod}` }
            });

            let totalOvertimeHours = 0;
            attendanceRecords.forEach(record => totalOvertimeHours += record.overtime);

            const basicSalary = employee.salary;
            const hra = basicSalary * 0.2;
            const overtimeRate = (basicSalary / 30 / 8) * 1.5;
            const overtimePay = totalOvertimeHours * overtimeRate;
            
            const providentFund = basicSalary * 0.05;
            const healthInsurance = 50;
            const taxableIncome = basicSalary + hra + overtimePay - providentFund;
            
            let incomeTax = 0;
            if (taxableIncome > 5000) {
                incomeTax = (taxableIncome - 5000) * 0.20 + (5000 * 0.10);
            } else {
                incomeTax = taxableIncome * 0.10;
            }

            const totalDeductions = providentFund + healthInsurance + incomeTax;
            const netSalary = basicSalary + hra + overtimePay - totalDeductions;

            await Payroll.create({
                employeeId: employee._id,
                payPeriod,
                basicSalary,
                hra,
                overtimePay,
                deductions: totalDeductions,
                deductionsBreakdown: { incomeTax, providentFund, healthInsurance },
                netSalary,
                status: 'Draft'
            });
            generatedCount++;
        }

        res.status(201).json({ success: true, message: `Batch payroll generated for ${generatedCount} employees.` });
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
