const express = require('express');
const { getSettings, updateSettings } = require('./settings.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Everyone can read settings
router.get('/', protect, getSettings);

// Only Admins can update settings
router.put('/', protect, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER'), updateSettings);

module.exports = router;
