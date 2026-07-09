const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Mobile number must be 10 digits']
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        validate: {
            validator: function(value) {
                return value <= new Date(); // Cannot exceed current date
            },
            message: 'Joining date cannot be in the future'
        }
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Self-reference for hierarchy
        default: null
    },
    salary: {
        type: Number,
        required: true,
        min: [0, 'Salary must be a positive number']
    },
    status: {
        type: String,
        enum: ['Active', 'Archived', 'Probation', 'Exited'],
        default: 'Active'
    },
    // ---- Professional Profile Fields ----
    profilePhoto: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    skills: {
        type: [{
            name: String,
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' }
        }],
        default: []
    },
    education: {
        type: [{
            degree: String,
            institution: String,
            year: String
        }],
        default: []
    },
    experience: {
        type: [{
            role: String,
            company: String,
            duration: String
        }],
        default: []
    },
    // ---- Leave Balance Fields ----
    leaveBalance: {
        casual: { type: Number, default: 15 },
        sick: { type: Number, default: 10 },
        earned: { type: Number, default: 15 }
    },
    // ---- Onboarding Tracking ----
    onboarding: {
        isCompleted: { type: Boolean, default: false },
        steps: {
            profileComplete: { type: Boolean, default: false },
            documentsUploaded: { type: Boolean, default: false },
            policiesAcknowledged: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

// Pre-save hook to generate employeeId if it doesn't exist
EmployeeSchema.pre('validate', async function() {
    if (this.isNew && !this.employeeId) {
        // Logic to auto-generate employeeId (e.g., EMP001, EMP002)
        const count = await mongoose.model('Employee').countDocuments();
        this.employeeId = `EMP${(count + 1).toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
