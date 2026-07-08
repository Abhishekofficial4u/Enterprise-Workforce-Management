const mongoose = require('mongoose');

const OnboardingTaskSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['IT Setup', 'HR & Documents', 'Training', 'Welcome'],
        default: 'HR & Documents'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    dueDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The person responsible for completing this task (e.g. IT admin for laptop)
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('OnboardingTask', OnboardingTaskSchema);
