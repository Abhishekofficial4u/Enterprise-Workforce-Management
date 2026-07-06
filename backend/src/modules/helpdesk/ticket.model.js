const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['IT', 'HR', 'Facilities', 'General'],
        default: 'IT'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responses: [responseSchema]
}, { timestamps: true });

// Pre-save hook to generate ticket ID
ticketSchema.pre('save', async function() {
    if (this.isNew) {
        // e.g., HD-1000
        const count = await this.constructor.countDocuments();
        this.ticketId = `HD-${1000 + count}`;
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
