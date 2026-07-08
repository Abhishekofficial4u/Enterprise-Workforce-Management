const OnboardingTask = require('./onboarding.model');
const Employee = require('./employee.model');

// @desc    Get onboarding tasks for an employee
// @route   GET /api/v1/hr/employees/:employeeId/onboarding
// @access  Private
exports.getOnboardingTasks = async (req, res) => {
    try {
        const tasks = await OnboardingTask.find({ employee: req.params.employeeId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new onboarding task
// @route   POST /api/v1/hr/employees/:employeeId/onboarding
// @access  Private (HR)
exports.createOnboardingTask = async (req, res) => {
    try {
        req.body.employee = req.params.employeeId;
        const task = await OnboardingTask.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate standard onboarding checklist for a new employee
// @route   POST /api/v1/hr/employees/:employeeId/onboarding/generate
// @access  Private (HR)
exports.generateStandardChecklist = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        
        // Check if tasks already exist
        const existing = await OnboardingTask.countDocuments({ employee: employeeId });
        if (existing > 0) {
            return res.status(400).json({ success: false, message: 'Checklist already generated' });
        }

        const standardTasks = [
            { employee: employeeId, title: 'Upload ID & Documents', category: 'HR & Documents' },
            { employee: employeeId, title: 'Sign Offer Letter', category: 'HR & Documents' },
            { employee: employeeId, title: 'Laptop & Email Setup', category: 'IT Setup' },
            { employee: employeeId, title: 'Security & Compliance Training', category: 'Training' },
            { employee: employeeId, title: 'Welcome Lunch with Team', category: 'Welcome' }
        ];

        const tasks = await OnboardingTask.insertMany(standardTasks);
        res.status(201).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an onboarding task
// @route   PUT /api/v1/hr/onboarding/:taskId
// @access  Private
exports.updateOnboardingTask = async (req, res) => {
    try {
        let task = await OnboardingTask.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // If marking as completed, set completedAt
        if (req.body.status === 'Completed' && task.status !== 'Completed') {
            req.body.completedAt = new Date();
        }

        task = await OnboardingTask.findByIdAndUpdate(req.params.taskId, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an onboarding task
// @route   DELETE /api/v1/hr/onboarding/:taskId
// @access  Private (HR)
exports.deleteOnboardingTask = async (req, res) => {
    try {
        const task = await OnboardingTask.findByIdAndDelete(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
