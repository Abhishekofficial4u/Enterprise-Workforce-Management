const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    targetEmployeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    strengths: {
        type: String,
        required: true
    },
    areasForImprovement: {
        type: String,
        required: true
    },
    additionalComments: {
        type: String
    },
    isAnonymous: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
