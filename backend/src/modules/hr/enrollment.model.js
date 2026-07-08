const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    trainingProgram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingProgram',
        required: true
    },
    status: {
        type: String,
        enum: ['Assigned', 'In Progress', 'Completed'],
        default: 'Assigned'
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    score: {
        type: Number // Optional if there's a quiz
    }
}, { timestamps: true });

// Prevent duplicate enrollments
EnrollmentSchema.index({ employee: 1, trainingProgram: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
