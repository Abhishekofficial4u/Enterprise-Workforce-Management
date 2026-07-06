const User = require('./user.model');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(403).json({ success: false, message: 'Account is locked. Please contact IT Administrator.' });
        }

        // Check password match
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Handle failed attempts
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.isLocked = true;
            }
            await user.save();
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Reset failed attempts on success
        user.failedLoginAttempts = 0;
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            role: user.role,
            userId: user.employeeId || user._id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// Temp function to seed initial Super Admin
exports.registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const user = await User.create({
            email,
            password,
            role: 'SUPER_ADMIN'
        });

        res.status(201).json({ success: true, message: 'Super Admin created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating admin', error: error.message });
    }
};

// @desc    Get all user credentials (Demo Presentation Feature)
// @route   POST /api/v1/auth/admin/credentials-vault
// @access  Private (SUPER_ADMIN)
exports.getCredentialsVault = async (req, res) => {
    try {
        const { adminPassword } = req.body;
        
        // 1. Verify that the user requesting is SUPER_ADMIN
        const adminUser = await User.findById(req.user.id).select('+password');
        if (adminUser.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to access credentials vault' });
        }

        // 2. Verify admin's password
        const isMatch = await adminUser.comparePassword(adminPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect admin password' });
        }

        // 3. Fetch all users and include their initialPassword field
        const users = await User.find().select('+initialPassword').lean();
        
        // Map user data with employee names if possible
        const Employee = require('../hr/employee.model');
        const employees = await Employee.find().lean();
        
        const vaultData = users.map(u => {
            const empProfile = employees.find(e => e.userId && e.userId.toString() === u._id.toString());
            return {
                id: u._id,
                name: empProfile ? empProfile.name : (u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'System User'),
                email: u.email,
                role: u.role,
                password: u.initialPassword || 'N/A' // Hashed password is NOT sent
            };
        });

        res.status(200).json({ success: true, count: vaultData.length, data: vaultData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Impersonate another user (Demo Presentation Feature)
// @route   POST /api/v1/auth/admin/impersonate/:userId
// @access  Private (SUPER_ADMIN)
exports.impersonateUser = async (req, res) => {
    try {
        // 1. Verify that the user requesting is SUPER_ADMIN
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to impersonate' });
        }

        // 2. Fetch the target user
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'Target user not found' });
        }

        // 3. Generate token for target user
        const token = generateToken(targetUser._id, targetUser.role);

        res.status(200).json({
            success: true,
            token,
            role: targetUser.role,
            userId: targetUser.employeeId || targetUser._id,
            message: `Successfully assumed identity of ${targetUser.email}`
        });
    } catch (error) {
        console.error('Impersonation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
