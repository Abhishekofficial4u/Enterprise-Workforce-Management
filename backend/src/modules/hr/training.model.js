const mongoose = require('mongoose');

const TrainingProgramSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Video', 'Document', 'Seminar', 'External Certification'],
        default: 'Video'
    },
    provider: {
        type: String,
        default: 'Internal'
    },
    durationMinutes: {
        type: Number,
        default: 60
    },
    isMandatory: {
        type: Boolean,
        default: false
    },
    resourceLink: {
        type: String // Link to the video or document
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('TrainingProgram', TrainingProgramSchema);
