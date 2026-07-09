const Settings = require('./settings.model');

// @desc    Get Global Settings
// @route   GET /api/v1/settings
// @access  Private (Everyone can read, or just Admins depending on requirements. Let's say everyone can read)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ singletonId: 'GLOBAL_SETTINGS' });
        
        // If settings don't exist yet, create defaults
        if (!settings) {
            settings = await Settings.create({});
        }

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Global Settings
// @route   PUT /api/v1/settings
// @access  Private (Admins Only)
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ singletonId: 'GLOBAL_SETTINGS' });
        
        if (!settings) {
            settings = await Settings.create({});
        }

        // Update fields
        if (req.body.companyName) settings.companyName = req.body.companyName;
        
        if (req.body.leaveBalances) {
            settings.leaveBalances = { ...settings.leaveBalances.toObject(), ...req.body.leaveBalances };
        }
        
        if (req.body.payroll) {
            settings.payroll = { ...settings.payroll.toObject(), ...req.body.payroll };
        }

        await settings.save();

        res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
