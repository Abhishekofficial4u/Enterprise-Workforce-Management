const Employee = require('../hr/employee.model');
const Asset = require('../assets/asset.model');
const Ticket = require('../helpdesk/ticket.model');
const aiReports = require('../ai/ai.reports');

// @desc    Get dashboard analytics
// @route   GET /api/v1/reports/dashboard
// @access  Private (SUPER_ADMIN)
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Employee Stats
        const totalEmployees = await Employee.countDocuments();
        
        const departmentDistribution = await Employee.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        const roleDistribution = await Employee.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 2. Asset Stats
        const totalAssets = await Asset.countDocuments();
        const assetStatusDist = await Asset.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);
        const assetCategoryDist = await Asset.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 3. Ticket Stats
        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: 'Open' });
        
        const ticketStatusDist = await Ticket.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 4. Burnout Risk (Predictive Analytics)
        // Simulate burnout risk by finding employees with the highest accumulated leave balances (meaning they aren't taking time off)
        const highRiskEmployees = await Employee.aggregate([
            { $match: { status: 'Active' } },
            { 
                $project: { 
                    name: 1, 
                    department: 1, 
                    designation: 1,
                    totalLeaveBalance: { 
                        $add: [ 
                            { $ifNull: ['$leaveBalance.casual', 0] }, 
                            { $ifNull: ['$leaveBalance.sick', 0] }, 
                            { $ifNull: ['$leaveBalance.earned', 0] } 
                        ] 
                    } 
                } 
            },
            { $sort: { totalLeaveBalance: -1 } },
            { $limit: 5 }
        ]);

        const burnoutRisk = highRiskEmployees.map(emp => ({
            name: emp.name,
            department: emp.department,
            role: emp.designation,
            riskScore: Math.min(Math.round((emp.totalLeaveBalance / 30) * 100), 98) // Normalize to a percentage up to 98%
        }));

        // 5. Payroll Stats
        const Payroll = require('../time-payroll/payroll.model');
        
        const totalPayrollDocs = await Payroll.countDocuments();
        const pendingPayrollDocs = await Payroll.countDocuments({ status: 'Pending' });
        
        const payrollSummary = await Payroll.aggregate([
            { $group: { _id: null, totalNetPay: { $sum: "$netPay" }, totalDeductions: { $sum: "$deductions" } } }
        ]);

        const totalNetPay = payrollSummary.length > 0 ? payrollSummary[0].totalNetPay : 0;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalEmployees,
                    totalAssets,
                    totalTickets,
                    openTickets,
                    totalPayrollProcessed: totalPayrollDocs,
                    pendingPayroll: pendingPayrollDocs,
                    totalNetPay
                },
                charts: {
                    departmentDistribution: departmentDistribution.map(d => ({ name: d.name || 'Unassigned', value: d.value })),
                    roleDistribution: roleDistribution.map(d => ({ name: d.name, value: d.value })),
                    assetStatusDist,
                    assetCategoryDist,
                    ticketStatusDist
                },
                predictive: {
                    burnoutRisk
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get AI Executive Summary
// @route   POST /api/v1/reports/ai-summary
// @access  Private (SUPER_ADMIN)
exports.getAiSummary = async (req, res) => {
    try {
        const { dashboardData } = req.body;
        if (!dashboardData) return res.status(400).json({ success: false, message: "Dashboard data required" });

        const summary = await aiReports.generateExecutiveSummary(dashboardData);
        res.status(200).json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
