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
    }
}, { timestamps: true });

// Pre-save hook to generate employeeId if it doesn't exist
EmployeeSchema.pre('validate', async function(next) {
    if (this.isNew && !this.employeeId) {
        // Logic to auto-generate employeeId (e.g., EMP001, EMP002)
        // In a real app, this should be an atomic operation or a sequence collection
        const count = await mongoose.model('Employee').countDocuments();
        this.employeeId = `EMP${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
