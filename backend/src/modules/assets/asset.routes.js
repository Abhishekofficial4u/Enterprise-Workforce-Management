const express = require('express');
const router = express.Router();
const assetController = require('./asset.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const cache = require('../../middlewares/cache.middleware');

// All routes require authentication and IT_ADMIN / SUPER_ADMIN role
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'IT_ADMIN'));

router.post('/', assetController.createAsset);
router.get('/', cache(120), assetController.getAllAssets);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
