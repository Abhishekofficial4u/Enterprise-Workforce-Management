const Shift = require('./shift.model');
const Employee = require('../hr/employee.model');

// @desc    Get shifts for a specific date range (for the org calendar)
// @route   GET /api/v1/time-payroll/shifts
// @access  Private (MANAGER, HR, ADMIN)
exports.getShifts = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const shifts = await Shift.find(query)
            .populate('employeeId', 'name designation profilePhoto department')
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({ success: true, data: shifts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign a new shift to an employee
// @route   POST /api/v1/time-payroll/shifts
// @access  Private (MANAGER, HR, ADMIN)
exports.createShift = async (req, res) => {
    try {
        const { employeeId, date, startTime, endTime, role, notes } = req.body;

        const shift = new Shift({
            employeeId,
            managerId: req.user.id, // The user assigning the shift
            date: new Date(date),
            startTime,
            endTime,
            role,
            notes
        });

        await shift.save();

        res.status(201).json({ success: true, data: shift });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a shift
// @route   DELETE /api/v1/time-payroll/shifts/:id
// @access  Private (MANAGER, HR, ADMIN)
exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }
        res.status(200).json({ success: true, message: 'Shift deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
