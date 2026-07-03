const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true
    },
    departmentCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
