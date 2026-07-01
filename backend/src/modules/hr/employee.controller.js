const Employee = require('./employee.model');
const User = require('../auth/user.model');
const bcrypt = require('bcrypt');

// @desc    Create a new employee
// @route   POST /api/v1/hr/employees
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.createEmployee = async (req, res) => {
    try {
        const { name, email, mobile, department, designation, joiningDate, salary, managerId } = req.body;

        // Create the employee record
        const employee = await Employee.create({
            name, email, mobile, department, designation, joiningDate, salary, manager: managerId || null
        });

        // Generate a random temporary password for the user account
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

        // Create the corresponding User account
        const user = await User.create({
            email,
            password: tempPassword, // In real app, trigger welcome email with this
            role: 'EMPLOYEE',
            employeeId: employee._id
        });

        res.status(201).json({
            success: true,
            data: employee,
            message: 'Employee created and login credentials generated'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all employees
// @route   GET /api/v1/hr/employees
// @access  Private
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ status: { $ne: 'Archived' } }).populate('manager', 'name employeeId');
        
        // Strip salary field if user is not HR or Finance
        const userRole = req.user.role;
        const canViewSalary = ['HR_MANAGER', 'FINANCE', 'SUPER_ADMIN'].includes(userRole);

        const safeEmployees = employees.map(emp => {
            const empData = emp.toObject();
            if (!canViewSalary) {
                delete empData.salary;
            }
            return empData;
        });

        res.status(200).json({ success: true, count: safeEmployees.length, data: safeEmployees });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Archive an employee (Soft delete)
// @route   DELETE /api/v1/hr/employees/:id
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.archiveEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, { status: 'Archived' }, { new: true });
        
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Also lock their user account
        await User.findOneAndUpdate({ email: employee.email }, { isLocked: true });

        res.status(200).json({ success: true, data: {}, message: 'Employee archived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
