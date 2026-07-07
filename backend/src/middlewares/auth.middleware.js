const jwt = require('jsonwebtoken');
const User = require('../modules/auth/user.model');

// Protect routes - Verify JWT
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route, token missing' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and populate roles
        req.user = await User.findById(decoded.id).select('-password').populate('roles');
        if (!req.user) {
             return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
        }
        
        // Flatten permissions from all assigned roles
        req.user.permissions = [];
        if (req.user.roles && req.user.roles.length > 0) {
            const permissionSet = new Set();
            req.user.roles.forEach(role => {
                if (role.permissions) {
                    role.permissions.forEach(p => permissionSet.add(p));
                }
            });
            req.user.permissions = Array.from(permissionSet);
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
};

// Role authorization (Legacy - checking by role name string)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Support both the new roles array (objects with .name) and the old role string
        let hasRole = false;
        
        if (req.user.roles && req.user.roles.length > 0) {
            hasRole = req.user.roles.some(r => roles.includes(r.name));
        } else if (req.user.role) {
            // Fallback to legacy string role
            hasRole = roles.includes(req.user.role);
        }

        if (!hasRole) {
            return res.status(403).json({ 
                success: false, 
                message: `User is not authorized to access this route` 
            });
        }
        next();
    };
};

// New Granular Permission Authorization
exports.requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user.permissions || req.user.permissions.length === 0) {
            return res.status(403).json({ 
                success: false, 
                message: `You do not have any permissions assigned.` 
            });
        }

        const hasAllRequired = requiredPermissions.every(p => req.user.permissions.includes(p));
        
        if (!hasAllRequired) {
            return res.status(403).json({ 
                success: false, 
                message: `Missing required permissions: ${requiredPermissions.join(', ')}` 
            });
        }
        next();
    };
};
