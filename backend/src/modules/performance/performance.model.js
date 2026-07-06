const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Usually their manager or HR
        required: true
    },
    reviewCycle: {
        type: String,
        required: true,
        enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Probation'],
        default: 'Q1'
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    },
    kpis: {
        qualityOfWork: { type: Number, min: 1, max: 5, required: true },
        communication: { type: Number, min: 1, max: 5, required: true },
        punctuality: { type: Number, min: 1, max: 5, required: true },
        teamwork: { type: Number, min: 1, max: 5, required: true },
        initiative: { type: Number, min: 1, max: 5, required: true }
    },
    overallScore: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Submitted', 'Acknowledged'],
        default: 'Submitted'
    }
}, { timestamps: true });

// Pre-save hook to calculate overall score automatically
performanceSchema.pre('save', function() {
    if (this.kpis) {
        const scores = Object.values(this.kpis);
        if (scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            this.overallScore = (sum / scores.length).toFixed(1);
        }
    }
});

// Ensure one review per cycle per employee
performanceSchema.index({ employeeId: 1, reviewCycle: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Performance', performanceSchema);
