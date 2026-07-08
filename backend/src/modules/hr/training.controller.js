const TrainingProgram = require('./training.model');
const Enrollment = require('./enrollment.model');

// --- Training Programs ---

// @desc    Get all training programs
// @route   GET /api/v1/hr/training
// @access  Private
exports.getTrainingPrograms = async (req, res) => {
    try {
        const programs = await TrainingProgram.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: programs.length, data: programs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a training program
// @route   POST /api/v1/hr/training
// @access  Private (HR)
exports.createTrainingProgram = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const program = await TrainingProgram.create(req.body);
        res.status(201).json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a training program
// @route   PUT /api/v1/hr/training/:id
// @access  Private (HR)
exports.updateTrainingProgram = async (req, res) => {
    try {
        const program = await TrainingProgram.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Training not found' });
        }
        res.status(200).json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a training program
// @route   DELETE /api/v1/hr/training/:id
// @access  Private (HR)
exports.deleteTrainingProgram = async (req, res) => {
    try {
        const program = await TrainingProgram.findByIdAndDelete(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Training not found' });
        }
        // Also delete enrollments for this program
        await Enrollment.deleteMany({ trainingProgram: req.params.id });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Enrollments ---

// @desc    Enroll an employee in a training program
// @route   POST /api/v1/hr/training/enroll
// @access  Private (HR)
exports.enrollEmployee = async (req, res) => {
    try {
        const { employeeId, trainingProgramId } = req.body;
        
        const existing = await Enrollment.findOne({ employee: employeeId, trainingProgram: trainingProgramId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Employee is already enrolled in this program' });
        }

        const enrollment = await Enrollment.create({
            employee: employeeId,
            trainingProgram: trainingProgramId,
            status: 'Assigned'
        });

        res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get enrollments for a specific training program
// @route   GET /api/v1/hr/training/:id/enrollments
// @access  Private (HR)
exports.getProgramEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ trainingProgram: req.params.id })
            .populate('employee', 'name email department designation');
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get enrollments for the logged-in employee (Learning Portal)
// @route   GET /api/v1/hr/employees/me/learning
// @access  Private (Employee)
exports.getMyLearning = async (req, res) => {
    try {
        // Find employee by user email
        const Employee = require('./employee.model');
        const employee = await Employee.findOne({ email: req.user.email });
        
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const enrollments = await Enrollment.find({ employee: employee._id })
            .populate('trainingProgram');
            
        res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update enrollment status (Employee marking complete)
// @route   PUT /api/v1/hr/learning/enrollments/:id
// @access  Private
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        let enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        if (req.body.status === 'Completed' && enrollment.status !== 'Completed') {
            req.body.completedAt = new Date();
        }

        enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
