const Department = require('./department.model');
const Employee = require('../hr/employee.model');

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
