const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.route('/')
    .get(protect, authorize('SUPER_ADMIN'), auditController.getAuditLogs);

module.exports = router;
