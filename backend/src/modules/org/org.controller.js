const Department = require('./department.model');
const Employee = require('../hr/employee.model');
const Project = require('../projects/project.model');

// @desc    Create a department
// @route   POST /api/v1/org/departments
// @access  Private (SUPER_ADMIN, ORG_ADMIN)
exports.createDepartment = async (req, res) => {
    try {
        const { departmentName, departmentCode, managerId } = req.body;

        const existing = await Department.findOne({ departmentCode });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department code already exists' });
        }

        const department = await Department.create({
            departmentName,
            departmentCode,
            manager: managerId || null
        });

        res.status(201).json({ success: true, data: department, message: 'Department created' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all departments
// @route   GET /api/v1/org/departments
// @access  Private
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ status: 'Active' }).populate('manager', 'name employeeId');
        
        // Count employees in each department
        const enrichedDepartments = await Promise.all(departments.map(async (dept) => {
            const count = await Employee.countDocuments({ department: dept.departmentName, status: 'Active' });
            return { ...dept.toObject(), employeeCount: count };
        }));

        res.status(200).json({ success: true, count: enrichedDepartments.length, data: enrichedDepartments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Archive a department
// @route   DELETE /api/v1/org/departments/:id
// @access  Private (SUPER_ADMIN, ORG_ADMIN)
exports.archiveDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Check if there are active employees in this department
        const employeeCount = await Employee.countDocuments({ department: department.departmentName, status: 'Active' });
        if (employeeCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot archive. There are ${employeeCount} active employees in this department.` });
        }

        department.status = 'Archived';
        await department.save();

        res.status(200).json({ success: true, message: 'Department archived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get organization hierarchy
// @route   GET /api/v1/org/hierarchy
// @access  Private
exports.getHierarchy = async (req, res) => {
    try {
        const employees = await Employee.find({ status: 'Active' })
            .select('_id name email designation department profilePhoto manager employeeId')
            .lean();

        // Build a map for O(1) lookups
        const empMap = {};
        employees.forEach(emp => {
            emp.children = [];
            empMap[emp._id.toString()] = emp;
        });

        const rootNodes = [];

        // Build the tree
        employees.forEach(emp => {
            if (emp.manager && empMap[emp.manager.toString()]) {
                empMap[emp.manager.toString()].children.push(emp);
            } else {
                rootNodes.push(emp);
            }
        });

        res.status(200).json({ success: true, data: rootNodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Global Search (Employees, Projects, Departments)
// @route   GET /api/v1/org/search?q=query
// @access  Private
exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: { employees: [], projects: [], departments: [] } });
        }

        const regex = new RegExp(q, 'i');

        // Search in parallel
        const [employees, projects, departments] = await Promise.all([
            Employee.find({ $or: [{ name: regex }, { email: regex }, { designation: regex }] }).select('name email designation profilePhoto department').limit(5),
            Project.find({ $or: [{ name: regex }, { description: regex }] }).select('name status').limit(5),
            Department.find({ departmentName: regex }).select('departmentName departmentCode').limit(5)
        ]);

        res.status(200).json({ 
            success: true, 
            data: { employees, projects, departments } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
