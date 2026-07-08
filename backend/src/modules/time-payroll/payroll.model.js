const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    payPeriod: {
        type: String, // Format: YYYY-MM
        required: true
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    hra: {
        type: Number,
        required: true,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    overtimePay: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    deductionsBreakdown: {
        incomeTax: { type: Number, default: 0 },
        providentFund: { type: Number, default: 0 },
        healthInsurance: { type: Number, default: 0 }
    },
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Reviewed', 'Approved', 'Paid'],
        default: 'Draft'
    }
}, { timestamps: true });

// One payroll record per employee per month
PayrollSchema.index({ employeeId: 1, payPeriod: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
