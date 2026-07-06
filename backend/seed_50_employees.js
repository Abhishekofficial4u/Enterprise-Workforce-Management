require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/user.model');
const Employee = require('./src/modules/hr/employee.model');

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Customer Support', 'IT'];
const roles = ['EMPLOYEE', 'EMPLOYEE', 'EMPLOYEE', 'EMPLOYEE', 'TEAM_LEAD', 'MANAGER'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedEmployees() {
    try {
        await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
        console.log('Connected to DB...');

        const employeesToCreate = 50;
        let createdCount = 0;

        for (let i = 0; i < employeesToCreate; i++) {
            const firstName = getRandomItem(firstNames);
            const lastName = getRandomItem(lastNames);
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@ewm.com`;
            const department = getRandomItem(departments);
            const role = getRandomItem(roles);
            const salary = Math.floor(Math.random() * 80000) + 40000;
            const mobile = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
            const joiningDate = getRandomDate(new Date(2020, 0, 1), new Date());

            // 1. Create User Account
            const newUser = new User({
                email,
                password: 'DemoPassword123!',
                initialPassword: 'DemoPassword123!',
                role
            });
            await newUser.save();

            // 2. Create Employee Profile
            const newEmployee = new Employee({
                userId: newUser._id,
                name,
                email,
                department,
                designation: `${department} Specialist`,
                role,
                salary,
                mobile,
                joiningDate
            });
            await newEmployee.save();

            // Link employee ID back to user
            newUser.employeeId = newEmployee._id;
            await newUser.save();

            createdCount++;
            if (createdCount % 10 === 0) console.log(`Created ${createdCount} employees...`);
        }

        console.log(`Successfully generated ${createdCount} realistic employee profiles!`);

    } catch (e) {
        console.error('Error seeding employees:', e);
    } finally {
        mongoose.disconnect();
    }
}

seedEmployees();
