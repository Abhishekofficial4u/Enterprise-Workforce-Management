const Employee = require('../hr/employee.model');
const Asset = require('../assets/asset.model');
const Ticket = require('../helpdesk/ticket.model');

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

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalEmployees,
                    totalAssets,
                    totalTickets,
                    openTickets
                },
                charts: {
                    departmentDistribution: departmentDistribution.map(d => ({ name: d.name || 'Unassigned', value: d.value })),
                    roleDistribution: roleDistribution.map(d => ({ name: d.name, value: d.value })),
                    assetStatusDist,
                    assetCategoryDist,
                    ticketStatusDist
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
