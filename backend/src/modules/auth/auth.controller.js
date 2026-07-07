const User = require('./user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/emailService');

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
        const user = await User.findOne({ email }).select('+password').populate('roles');

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

        // Flatten permissions from all assigned roles
        const permissions = new Set();
        const roleNames = [];
        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(r => {
                roleNames.push(r.name);
                if (r.permissions) {
                    r.permissions.forEach(p => permissions.add(p));
                }
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role); // keeping user.role in JWT for legacy fallback

        res.status(200).json({
            success: true,
            token,
            role: user.role, // legacy string
            roles: roleNames, // new array of role names
            permissions: Array.from(permissions), // granular features
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

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.headers.origin || 'http://localhost:3000'}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        // Send email in background
        sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        }).catch(async (err) => {
            console.error('Failed to send reset email:', err);
            // Optionally revert the token if we wanted to
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        });

        // Respond immediately so UI doesn't hang. Include resetUrl for Render Free Tier fallback.
        res.status(200).json({ 
            success: true, 
            message: 'If an account exists, a reset link was sent',
            resetUrl: resetUrl 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.isLocked = false;
        user.failedLoginAttempts = 0;
        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            role: user.role,
            userId: user.employeeId || user._id,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

// @desc    Test Email functionality on Live Server
// @route   GET /api/v1/auth/test-email
// @access  Public
exports.testEmailRoute = async (req, res) => {
    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Render Live Test Email',
            text: 'If you see this, the Render server successfully connected to Gmail!'
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully from Render!',
            info: info.response,
            user: process.env.EMAIL_USER
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send email from Render',
            error: error.message,
            stack: error.stack,
            user: process.env.EMAIL_USER,
            passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        });
    }
};
