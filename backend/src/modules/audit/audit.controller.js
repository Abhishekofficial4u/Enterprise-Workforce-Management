const AuditLog = require('./audit.model');

// @desc    Get all audit logs
// @route   GET /api/v1/audit
// @access  Private (SUPER_ADMIN)
exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, page = 1, resource, action } = req.query;
        
        let query = {};
        if (resource) query.resource = resource;
        if (action) query.action = action;

        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .populate('user', 'name role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.status(200).json({ 
            success: true, 
            count: logs.length, 
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: logs 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
