const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['News', 'Event', 'Holiday', 'Birthday', 'Work Anniversary'],
        default: 'News'
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High'],
        default: 'Normal'
    },
    eventDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    targetDepartments: [{
        type: String
    }], // Empty array means all departments
    relatedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Useful for auto-generated birthday/anniversary posts
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
