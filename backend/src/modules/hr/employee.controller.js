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
        const employees = await Employee.find().populate('manager', 'name employeeId');
        
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

// @desc    Update employee details
// @route   PUT /api/v1/hr/employees/:id
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.updateEmployee = async (req, res) => {
    try {
        const { department, designation, salary, status } = req.body;
        
        const updateFields = {};
        if (department !== undefined) updateFields.department = department;
        if (designation !== undefined) updateFields.designation = designation;
        if (salary !== undefined) updateFields.salary = salary;
        if (status !== undefined) updateFields.status = status;

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Sync User account active status
        if (status !== undefined) {
            await User.findOneAndUpdate(
                { employeeId: employee._id }, 
                { isActive: status !== 'Archived' }
            );
        }

        res.status(200).json({ success: true, data: employee, message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Archive employee (soft delete)
// @route   DELETE /api/v1/hr/employees/:id
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.archiveEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { status: 'Archived' },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Also deactivate the user account
        await User.findOneAndUpdate({ employeeId: employee.employeeId }, { isActive: false });

        res.status(200).json({ success: true, data: employee, message: 'Employee archived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in employee profile
// @route   GET /api/v1/hr/employees/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No linked employee profile' });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update logged in employee profile (professional info)
// @route   PUT /api/v1/hr/employees/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No linked employee profile' });

        // Allowed fields to update
        const { profilePhoto, bio, skills, education, experience } = req.body;
        const updateFields = {};
        if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
        if (bio !== undefined) updateFields.bio = bio;
        if (skills !== undefined) updateFields.skills = skills;
        if (education !== undefined) updateFields.education = education;
        if (experience !== undefined) updateFields.experience = experience;

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            updateFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: employee, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
