const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    postedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
