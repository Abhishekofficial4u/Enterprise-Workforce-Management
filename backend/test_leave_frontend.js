const mongoose = require('mongoose');
const User = require('./src/modules/auth/user.model');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
    const user = await User.findOne({ email: 'employee@ewm.com' });
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production', {
        expiresIn: '1d'
    });
    console.log("Token received");

    try {
        const res = await fetch('http://localhost:5000/api/v1/time-payroll/leave/balance', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Balance Response:", data);
    } catch (e) {
        console.error("Error Balance:", e.message);
    }

    try {
        const res = await fetch('http://localhost:5000/api/v1/time-payroll/leave', {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leaveType: 'Sick Leave',
                startDate: '2026-07-10',
                endDate: '2026-07-11',
                reason: 'Sick'
            })
        });
        const data = await res.json();
        console.log("Apply Leave Response:", data);
    } catch (e) {
        console.error("Error Apply Leave:", e.message);
    }

    process.exit(0);
}
test();
