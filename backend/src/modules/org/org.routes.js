const express = require('express');
const router = express.Router();
const orgController = require('./org.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.use(protect);

router.route('/departments')
    .get(orgController.getDepartments)
    .post(authorize('SUPER_ADMIN', 'ORG_ADMIN'), orgController.createDepartment);

router.route('/departments/:id')
    .delete(authorize('SUPER_ADMIN', 'ORG_ADMIN'), orgController.archiveDepartment);

module.exports = router;
