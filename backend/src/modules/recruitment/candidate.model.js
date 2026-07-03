const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    resumeUrl: { type: String },
    stage: { 
        type: String, 
        enum: ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'], 
        default: 'Applied' 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
