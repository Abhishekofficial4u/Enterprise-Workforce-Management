const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // e.g., '09:00'
        required: true
    },
    endTime: {
        type: String, // e.g., '17:00'
        required: true
    },
    role: {
        type: String, // e.g., 'Cashier', 'Support L1', 'Developer'
        default: 'General'
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Ensure an employee doesn't have overlapping shifts on the same day
shiftSchema.index({ employeeId: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Shift', shiftSchema);
