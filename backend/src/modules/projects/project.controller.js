const Project = require('./project.model');
const Task = require('./task.model');

// @desc    Get all projects (filtered by user role/access)
// @route   GET /api/v1/projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        const { role, employeeId } = req.user;
        let query = {};
        
        // If regular employee, only show projects they are managing or a member of
        if (role === 'EMPLOYEE' || role === 'FINANCE') {
            if (!employeeId) return res.status(200).json({ success: true, count: 0, data: [] });
            query = {
                $or: [
                    { manager: employeeId },
                    { teamMembers: employeeId }
                ]
            };
        }

        const projects = await Project.find(query)
            .populate('manager', 'name email profilePhoto designation')
            .populate('teamMembers', 'name email profilePhoto designation')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'name email profilePhoto designation')
            .populate('teamMembers', 'name email profilePhoto designation');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Fetch associated tasks
        const tasks = await Task.find({ project: project._id }).populate('assignee', 'name email profilePhoto');

        res.status(200).json({ success: true, data: { project, tasks } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Managers, HR, Admin)
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create({
            ...req.body,
            manager: req.body.manager || req.user.employeeId // Default manager to creator if not specified
        });

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private (Admin/HR)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        await project.deleteOne();
        
        // Delete all associated tasks
        await Task.deleteMany({ project: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- TASK METHODS ---

// @desc    Create a task for a project
// @route   POST /api/v1/projects/:projectId/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignee, priority, dueDate } = req.body;
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignee: assignee || null,
            priority,
            dueDate
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update task (e.g. Kanban status drag/drop, time logging)
// @route   PUT /api/v1/projects/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const { status, timeLogged } = req.body;
        
        let updateData = { ...req.body };
        
        if (timeLogged) {
            // increment time logged
            updateData.totalTimeLogged = (task.totalTimeLogged || 0) + Number(timeLogged);
            delete updateData.timeLogged; // don't write this to schema directly
        }

        task = await Task.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate('assignee', 'name email profilePhoto');

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/v1/projects/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
