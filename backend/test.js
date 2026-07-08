const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

const testUsers = [
    { email: 'admin@ewm.com', name: 'System Admin', role: 'SUPER_ADMIN', tests: [
        { name: 'Dashboard', path: '/reports/dashboard' },
        { name: 'Employees', path: '/hr/employees' },
        { name: 'All Attendance', path: '/time-payroll/attendance/daily' },
        { name: 'All Leaves', path: '/time-payroll/leave/all' },
        { name: 'All Payrolls', path: '/time-payroll/payroll/all' },
        { name: 'Projects', path: '/projects/projects' },
        { name: 'Helpdesk Tickets', path: '/helpdesk' }
    ]},
    { email: 'hr@ewm.com', name: 'HR Manager', role: 'HR_MANAGER', tests: [
        { name: 'Dashboard Reports', path: '/reports/dashboard' },
        { name: 'Employees', path: '/hr/employees' },
        { name: 'All Attendance', path: '/time-payroll/attendance/daily' },
        { name: 'Performance Reviews', path: '/performance' }
    ]},
    { email: 'finance@ewm.com', name: 'Finance Lead', role: 'FINANCE', tests: [
        { name: 'Dashboard Reports', path: '/reports/dashboard' },
        { name: 'All Payrolls', path: '/time-payroll/payroll/all' },
        { name: 'Employees', path: '/hr/employees' }
    ]},
    { email: 'manager@ewm.com', name: 'Project Manager', role: 'MANAGER', tests: [
        { name: 'Dashboard Reports', path: '/reports/dashboard' },
        { name: 'All Attendance', path: '/time-payroll/attendance/daily' },
        { name: 'All Leaves', path: '/time-payroll/leave/all' },
        { name: 'Projects', path: '/projects/projects' },
        { name: 'Performance Reviews', path: '/performance' }
    ]},
    { email: 'employee@ewm.com', name: 'Standard Employee', role: 'EMPLOYEE', tests: [
        { name: 'My Attendance', path: '/time-payroll/attendance/my' },
        { name: 'My Leaves', path: '/time-payroll/leave/my' },
        { name: 'My Payslips', path: '/time-payroll/payroll/my' }
    ]}
];

async function runTests() {
    console.log('--- STARTING COMPREHENSIVE ENDPOINT TEST ---');
    for (const tu of testUsers) {
        console.log(`\n=============================`);
        console.log(`TESTING ROLE: ${tu.role} (${tu.email})`);
        
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, { email: tu.email, password: 'Password123!' });
            token = loginRes.data.token;
            console.log(`[SUCCESS] Logged in as ${tu.role}`);
        } catch (error) {
            console.error(`[ERROR] Failed to login as ${tu.email}:`, error.response?.data?.message || error.message);
            continue;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        for (const test of tu.tests) {
            try {
                const res = await axios.get(`${API_URL}${test.path}`, config);
                let dataInfo = 'Empty Array';
                if (Array.isArray(res.data.data) && res.data.data.length > 0) dataInfo = `${res.data.data.length} items`;
                else if (res.data.data && typeof res.data.data === 'object') dataInfo = 'Object data';
                console.log(`   [✔] ${test.name} (${test.path}) - 200 OK - Data: ${dataInfo}`);
            } catch (error) {
                const status = error.response ? error.response.status : 'NETWORK_ERROR';
                const msg = error.response?.data?.message || error.message;
                console.log(`   [X] ${test.name} (${test.path}) - ${status} FAILED - ${msg}`);
            }
        }
    }
    console.log(`\n=============================`);
    console.log('--- TEST COMPLETE ---');
}

runTests();
