require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Employee = require('./src/modules/hr/employee.model.js');
const User = require('./src/modules/auth/user.model.js');

const seedEmployees = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_workforce');
        console.log('Connected to DB');

        // Check if employees already exist
        const count = await Employee.countDocuments();
        if (count > 0) {
            console.log('Employees already exist! Skipping seed.');
            process.exit(0);
        }

        const employees = [
            { name: 'Rahul Sharma', email: 'rahul@enterprisewfm.com', mobile: '9876543210', department: 'Engineering', designation: 'Software Engineer', joiningDate: new Date('2025-01-15'), salary: 80000, status: 'Active' },
            { name: 'Priya Mehta', email: 'priya@enterprisewfm.com', mobile: '9876543211', department: 'HR', designation: 'HR Manager', joiningDate: new Date('2024-03-02'), salary: 90000, status: 'Active' },
            { name: 'Amit Verma', email: 'amit@enterprisewfm.com', mobile: '9876543212', department: 'Finance', designation: 'Finance Executive', joiningDate: new Date('2024-06-10'), salary: 75000, status: 'Active' },
            { name: 'Sneha Patil', email: 'sneha@enterprisewfm.com', mobile: '9876543213', department: 'Marketing', designation: 'Marketing Lead', joiningDate: new Date('2026-05-01'), salary: 85000, status: 'Probation' },
            { name: 'Karan Singh', email: 'karan@enterprisewfm.com', mobile: '9876543214', department: 'Engineering', designation: 'Senior Developer', joiningDate: new Date('2023-08-20'), salary: 120000, status: 'Active' }
        ];

        for (const empData of employees) {
            const emp = await Employee.create(empData);
            await User.create({
                email: emp.email,
                password: 'Password123!',
                role: emp.department === 'HR' ? 'HR_MANAGER' : (emp.department === 'Finance' ? 'FINANCE' : 'EMPLOYEE'),
                employeeId: emp._id
            });
            console.log(`Created employee: ${emp.name}`);
        }

        console.log('Successfully seeded employees!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
};

seedEmployees();
