const express = require('express');
const router = express.Router();
const orgController = require('./org.controller');
const announcementController = require('./announcement.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.get('/search', protect, orgController.globalSearch);

// --- Announcement Routes ---
router.route('/announcements')
    .get(protect, announcementController.getAnnouncements)
    .post(protect, authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), announcementController.createAnnouncement);

router.route('/announcements/:id')
    .put(protect, authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), announcementController.updateAnnouncement)
    .delete(protect, authorize('HR_MANAGER', 'SUPER_ADMIN', 'ORG_ADMIN'), announcementController.deleteAnnouncement);

router.use(protect);

router.route('/departments')
    .get(orgController.getDepartments)
    .post(authorize('SUPER_ADMIN', 'ORG_ADMIN'), orgController.createDepartment);

router.route('/hierarchy')
    .get(orgController.getHierarchy);

router.route('/departments/:id')
    .delete(authorize('SUPER_ADMIN', 'ORG_ADMIN'), orgController.archiveDepartment);

module.exports = router;
