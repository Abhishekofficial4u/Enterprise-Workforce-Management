const Employee = require('./employee.model');
const User = require('../auth/user.model');
const bcrypt = require('bcrypt');
const sendEmail = require('../../utils/emailService');

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
            password: tempPassword,
            initialPassword: tempPassword,
            role: 'EMPLOYEE',
            employeeId: employee._id
        });

        // Send Welcome Email
        const loginUrl = `${req.headers.origin || 'http://localhost:3000'}/login`;
        const emailHtml = `
            <h2>Welcome to the Team, ${name}!</h2>
            <p>Your employee profile has been created in the Enterprise Workforce Management system.</p>
            <p>You can log in to your dashboard here: <a href="${loginUrl}">${loginUrl}</a></p>
            <p><strong>Your Temporary Credentials:</strong></p>
            <ul>
                <li>Email: ${email}</li>
                <li>Password: ${tempPassword}</li>
            </ul>
            <p>We recommend changing your password after your first login.</p>
        `;

        // Send Welcome Email in background
        sendEmail({
            email,
            subject: 'Welcome to Enterprise Workforce - Login Credentials',
            html: emailHtml
        }).catch(emailErr => {
            console.error('Welcome email failed to send:', emailErr);
        });

        // Invalidate Cache
        const { getRedisClient } = require('../../shared/redis');
        const redisClient = getRedisClient();
        if (redisClient) {
            redisClient.keys('__express__/api/v1/hr/employees*').then(keys => {
                if (keys.length > 0) redisClient.del(keys);
            }).catch(err => console.error('Cache invalidation error', err));
        }

        res.status(201).json({
            success: true,
            data: employee,
            tempPassword: tempPassword,
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
        let query = {};
        const permissions = req.user.permissions || [];
        const userRole = req.user.role;
        
        const canViewAll = permissions.includes('view_all_data') || 
                           permissions.includes('manage_employees') || 
                           userRole === 'FINANCE';
        
        // If user does not have global view permissions, but has view_team
        if (!canViewAll) {
            if (permissions.includes('view_team')) {
                query.manager = req.user.employeeId;
            } else {
                // If they don't even have view_team, restrict to self
                query._id = req.user.employeeId;
            }
        }

        const employees = await Employee.find(query).populate('manager', 'name employeeId');

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

        // Invalidate Cache
        const { getRedisClient } = require('../../shared/redis');
        const redisClient = getRedisClient();
        if (redisClient) {
            redisClient.keys('__express__/api/v1/hr/employees*').then(keys => {
                if (keys.length > 0) redisClient.del(keys);
            }).catch(err => console.error('Cache invalidation error', err));
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

        // Invalidate Cache
        const { getRedisClient } = require('../../shared/redis');
        const redisClient = getRedisClient();
        if (redisClient) {
            redisClient.keys('__express__/api/v1/hr/employees*').then(keys => {
                if (keys.length > 0) redisClient.del(keys);
            }).catch(err => console.error('Cache invalidation error', err));
        }

        res.status(200).json({ success: true, data: employee, message: 'Employee archived successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Permanently Delete employee
// @route   DELETE /api/v1/hr/employees/:id/permanent
// @access  Private (SUPER_ADMIN)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Delete associated user account
        await User.findOneAndDelete({ employeeId: req.params.id });

        // Hard delete the employee
        await Employee.findByIdAndDelete(req.params.id);

        // Invalidate Cache
        const { getRedisClient } = require('../../shared/redis');
        const redisClient = getRedisClient();
        if (redisClient) {
            redisClient.keys('__express__/api/v1/hr/employees*').then(keys => {
                if (keys.length > 0) redisClient.del(keys);
            }).catch(err => console.error('Cache invalidation error', err));
        }

        res.status(200).json({ success: true, message: 'Employee permanently deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update My Onboarding Status
// @route   PUT /api/v1/hr/employees/me/onboarding
// @access  Private (Self)
exports.updateOnboarding = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No linked employee profile' });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
        
        employee.onboarding = {
            ...employee.onboarding,
            ...req.body.onboarding,
            steps: {
                ...employee.onboarding.steps,
                ...(req.body.onboarding?.steps || {})
            }
        };

        // Auto-complete onboarding if all steps are true
        if (
            employee.onboarding.steps.profileComplete &&
            employee.onboarding.steps.documentsUploaded &&
            employee.onboarding.steps.policiesAcknowledged
        ) {
            employee.onboarding.isCompleted = true;
        }

        await employee.save();
        res.status(200).json({ success: true, data: employee });
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
        const { profilePhoto, bio, skills, education, experience, name } = req.body;
        const updateFields = {};
        if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
        if (bio !== undefined) updateFields.bio = bio;
        if (skills !== undefined) updateFields.skills = skills;
        if (education !== undefined) updateFields.education = education;
        if (experience !== undefined) updateFields.experience = experience;
        if (name !== undefined) updateFields.name = name;

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
