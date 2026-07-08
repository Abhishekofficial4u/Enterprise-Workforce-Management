const Announcement = require('./announcement.model');

// @desc    Get all active announcements
// @route   GET /api/v1/org/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
    try {
        // Find active announcements, sort by priority and then date
        const announcements = await Announcement.find({ isActive: true })
            .populate('createdBy', 'email role')
            .populate('relatedEmployee', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create an announcement
// @route   POST /api/v1/org/announcements
// @access  Private (HR/Admin)
exports.createAnnouncement = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const announcement = await Announcement.create(req.body);
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update an announcement
// @route   PUT /api/v1/org/announcements/:id
// @access  Private (HR/Admin)
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/v1/org/announcements/:id
// @access  Private (HR/Admin)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
