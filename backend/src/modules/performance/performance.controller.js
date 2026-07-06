const Performance = require('./performance.model');
const Employee = require('../hr/employee.model');

// @desc    Create a new performance review
// @route   POST /api/v1/performance
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.createReview = async (req, res) => {
    try {
        const { employeeId, reviewCycle, year, kpis, feedback } = req.body;
        const reviewerId = req.user.employeeId; // Assuming the logged in user is the reviewer

        if (!reviewerId) {
            return res.status(403).json({ success: false, message: 'Only linked employees can submit reviews' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const review = await Performance.create({
            employeeId,
            reviewerId,
            reviewCycle,
            year,
            kpis,
            feedback
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A review already exists for this employee in this cycle and year' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all reviews (for HR/Admins)
// @route   GET /api/v1/performance
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Performance.find()
            .populate('employeeId', 'name department designation profilePhoto')
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user's reviews
// @route   GET /api/v1/performance/my
// @access  Private
exports.getMyReviews = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'No linked employee profile' });
        }

        const reviews = await Performance.find({ employeeId })
            .populate('reviewerId', 'name designation')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Acknowledge a review
// @route   PATCH /api/v1/performance/:id/acknowledge
// @access  Private
exports.acknowledgeReview = async (req, res) => {
    try {
        const review = await Performance.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Only the reviewed employee can acknowledge it
        if (review.employeeId.toString() !== req.user.employeeId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to acknowledge this review' });
        }

        review.status = 'Acknowledged';
        await review.save();

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
