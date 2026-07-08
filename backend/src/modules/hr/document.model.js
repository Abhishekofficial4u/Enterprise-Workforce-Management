const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Contract', 'ID', 'Certification', 'Policy', 'Resume', 'Other'],
        default: 'Other'
    },
    url: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
