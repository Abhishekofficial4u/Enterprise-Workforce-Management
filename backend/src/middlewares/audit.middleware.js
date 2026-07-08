const AuditLog = require('../modules/audit/audit.model');

/**
 * Express middleware to automatically log audit events
 * @param {string} action - The action being performed (e.g. 'CREATE_EMPLOYEE', 'RUN_PAYROLL')
 * @param {string} resource - The resource being modified (e.g. 'EMPLOYEES', 'PAYROLL')
 */
const auditLog = (action, resource) => {
    return async (req, res, next) => {
        // We hook into the finish event to log success or failure based on status code
        res.on('finish', async () => {
            if (req.user && req.user._id) {
                try {
                    const status = (res.statusCode >= 200 && res.statusCode < 400) ? 'SUCCESS' : 'FAILURE';
                    
                    const metadata = {
                        method: req.method,
                        url: req.originalUrl,
                        statusCode: res.statusCode,
                        bodyParams: Object.keys(req.body).length > 0 ? req.body : undefined,
                        queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
                    };
                    
                    // Filter out passwords or sensitive info from body before saving
                    if (metadata.bodyParams && metadata.bodyParams.password) {
                        metadata.bodyParams.password = '[REDACTED]';
                    }

                    await AuditLog.create({
                        userId: req.user._id,
                        action,
                        resource,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        status,
                        metadata
                    });
                } catch (error) {
                    console.error('Failed to write audit log:', error);
                }
            }
        });
        next();
    };
};

module.exports = auditLog;
