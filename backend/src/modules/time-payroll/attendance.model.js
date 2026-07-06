const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    clockIn: {
        type: Date
    },
    clockInLocation: {
        lat: Number,
        lng: Number
    },
    clockOut: {
        type: Date
    },
    clockOutLocation: {
        lat: Number,
        lng: Number
    },
    workingHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Holiday', 'Work From Home'],
        default: 'Absent'
    }
}, { timestamps: true });

// Ensure an employee can only have one attendance record per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
