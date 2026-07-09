const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Only one settings document should exist
    singletonId: {
        type: String,
        default: 'GLOBAL_SETTINGS',
        unique: true
    },
    leaveBalances: {
        casual: { type: Number, default: 15 },
        sick: { type: Number, default: 10 },
        earned: { type: Number, default: 15 }
    },
    payroll: {
        baseWorkingHoursPerDay: { type: Number, default: 8 },
        overtimeMultiplier: { type: Number, default: 1.5 },
        taxRatePercentage: { type: Number, default: 10 }
    },
    companyName: {
        type: String,
        default: 'Enterprise Workforce Inc.'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
