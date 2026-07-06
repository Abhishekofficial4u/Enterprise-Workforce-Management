const Asset = require('./asset.model');

// @desc    Add a new asset
// @route   POST /api/v1/assets
// @access  Private (SUPER_ADMIN, IT_ADMIN)
exports.createAsset = async (req, res) => {
    try {
        const { name, category, purchaseDate, cost } = req.body;
        
        const asset = await Asset.create({
            name,
            category,
            purchaseDate,
            cost
        });

        res.status(201).json({ success: true, data: asset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all assets
// @route   GET /api/v1/assets
// @access  Private (SUPER_ADMIN, IT_ADMIN)
exports.getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find()
            .populate('assignedTo', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: assets.length, data: assets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update asset (assign to employee or update status)
// @route   PUT /api/v1/assets/:id
// @access  Private (SUPER_ADMIN, IT_ADMIN)
exports.updateAsset = async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }

        if (status) asset.status = status;
        
        if (asset.status === 'Under Maintenance' || asset.status === 'Retired') {
            asset.assignedTo = null;
        } else if (assignedTo !== undefined) {
            asset.assignedTo = assignedTo;
            if (assignedTo) {
                asset.status = 'Assigned';
            } else if (asset.status === 'Assigned') {
                asset.status = 'Available';
            }
        }

        await asset.save();
        
        // Return populated version
        const updatedAsset = await Asset.findById(asset._id).populate('assignedTo', 'name email department');
        res.status(200).json({ success: true, data: updatedAsset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete asset
// @route   DELETE /api/v1/assets/:id
// @access  Private (SUPER_ADMIN, IT_ADMIN)
exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ success: false, message: 'Asset not found' });
        }

        await asset.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
