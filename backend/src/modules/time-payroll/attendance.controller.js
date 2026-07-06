const Attendance = require('./attendance.model');
const Employee = require('../hr/employee.model');

// @desc    Clock in
// @route   POST /api/v1/time-payroll/attendance/clock-in
// @access  Private (EMPLOYEE)
exports.clockIn = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from JWT
        const employeeId = req.user.employeeId;
        const { lat, lng } = req.body;

        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'User is not linked to an employee profile' });
        }

        const dateString = new Date().toISOString().split('T')[0];

        // Check if already clocked in today
        let attendance = await Attendance.findOne({ employeeId, date: dateString });
        if (attendance) {
            return res.status(400).json({ success: false, message: 'Already clocked in for today' });
        }

        attendance = await Attendance.create({
            employeeId,
            date: dateString,
            clockIn: new Date(),
            clockInLocation: lat && lng ? { lat, lng } : undefined,
            status: 'Present' // Will adjust to Late in a real app based on office hours
        });

        res.status(201).json({ success: true, data: attendance, message: 'Clocked in successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Clock out
// @route   POST /api/v1/time-payroll/attendance/clock-out
// @access  Private (EMPLOYEE)
exports.clockOut = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });
        
        const { lat, lng } = req.body;

        const dateString = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ employeeId, date: dateString });

        if (!attendance) {
            return res.status(400).json({ success: false, message: 'You have not clocked in today' });
        }
        if (attendance.clockOut) {
            return res.status(400).json({ success: false, message: 'Already clocked out' });
        }

        const clockOutTime = new Date();
        const clockInTime = new Date(attendance.clockIn);
        
        // Calculate working hours
        const diffMs = clockOutTime - clockInTime;
        const workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        
        let overtime = 0;
        if (workingHours > 9) { // Assuming 9 hours standard
            overtime = parseFloat((workingHours - 9).toFixed(2));
        }

        attendance.clockOut = clockOutTime;
        if (lat && lng) {
            attendance.clockOutLocation = { lat, lng };
        }
        attendance.workingHours = workingHours;
        attendance.overtime = overtime;

        await attendance.save();

        res.status(200).json({ success: true, data: attendance, message: 'Clocked out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my attendance
// @route   GET /api/v1/time-payroll/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;
        if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile' });

        const history = await Attendance.find({ employeeId }).sort({ date: -1 });
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all attendance records for a specific date
// @route   GET /api/v1/time-payroll/attendance/daily
// @access  Private (HR_MANAGER, SUPER_ADMIN)
exports.getAllAttendance = async (req, res) => {
    try {
        let dateString = req.query.date;
        if (!dateString) {
            dateString = new Date().toISOString().split('T')[0];
        }

        // Fetch all employees (to know who is absent)
        const allEmployees = await Employee.find({ status: { $ne: 'Archived' } }).select('_id employeeId name department designation');
        
        // Fetch attendance records for the date
        const attendanceRecords = await Attendance.find({ date: dateString });
        
        // Create a map for quick lookup using the Mongo _id
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            attendanceMap[record.employeeId.toString()] = record;
        });

        const report = allEmployees.map(emp => {
            const record = attendanceMap[emp._id.toString()];
            return {
                employeeId: emp.employeeId, // The string EMP001 for UI
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                clockIn: record ? record.clockIn : null,
                clockInLocation: record ? record.clockInLocation : null,
                clockOut: record ? record.clockOut : null,
                clockOutLocation: record ? record.clockOutLocation : null,
                workingHours: record ? record.workingHours : 0,
                overtime: record ? record.overtime : 0,
                status: record ? record.status : 'Absent'
            };
        });

        res.status(200).json({ success: true, date: dateString, count: report.length, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
