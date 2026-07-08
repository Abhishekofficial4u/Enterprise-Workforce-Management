require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../modules/auth/user.model');
const Employee = require('../modules/hr/employee.model');
const Role = require('../modules/auth/role.model');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_workforce';

const demoProfiles = [
    {
        name: 'Sarah SuperAdmin',
        email: 'superadmin@ewm.com',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        designation: 'CEO',
        salary: 250000
    },
    {
        name: 'Oliver OrgAdmin',
        email: 'orgadmin@ewm.com',
        role: 'ORG_ADMIN',
        department: 'Operations',
        designation: 'Director of Operations',
        salary: 180000
    },
    {
        name: 'Hannah HR',
        email: 'hr@ewm.com',
        role: 'HR_MANAGER',
        department: 'Human Resources',
        designation: 'VP of HR',
        salary: 140000
    },
    {
        name: 'Mike Manager',
        email: 'manager@ewm.com',
        role: 'MANAGER',
        department: 'Engineering',
        designation: 'Engineering Manager',
        salary: 160000
    },
    {
        name: 'Fiona Finance',
        email: 'finance@ewm.com',
        role: 'FINANCE',
        department: 'Finance',
        designation: 'Chief Financial Officer',
        salary: 175000
    },
    {
        name: 'Ian IT',
        email: 'it@ewm.com',
        role: 'IT_ADMIN',
        department: 'Information Technology',
        designation: 'IT Director',
        salary: 130000
    },
    {
        name: 'Eric Employee',
        email: 'employee@ewm.com',
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 110000
    }
];

const seedDemoData = async () => {
    try {
        console.log('🧹 Cleaning existing demo accounts...');
        for (const profile of demoProfiles) {
            await User.deleteMany({ email: profile.email });
            await Employee.deleteMany({ email: profile.email });
        }

        console.log('🌱 Seeding new demo accounts...');
        
        const credentialsList = [];

        for (const profile of demoProfiles) {
            const roleDoc = await Role.findOne({ name: profile.role });
            
            const emp = await Employee.create({
                name: profile.name,
                email: profile.email,
                mobile: '9' + Math.floor(100000000 + Math.random() * 900000000), // Random 10-digit number
                department: profile.department,
                designation: profile.designation,
                joiningDate: new Date(),
                salary: profile.salary,
                bio: `Hi, I am ${profile.name}, the ${profile.designation}.`
            });

            const password = 'Password123!';
            
            const user = await User.create({
                email: profile.email,
                password: password,
                initialPassword: password,
                role: profile.role,
                roles: roleDoc ? [roleDoc._id] : [],
                employeeId: emp._id
            });

            credentialsList.push({
                Role: profile.role,
                Email: profile.email,
                Password: password
            });
            console.log(`✔️ Created ${profile.role} (${profile.email})`);
        }

        console.log('\n🎉 Demo Data Seeded Successfully!');
        console.table(credentialsList);
        return credentialsList;

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
};

module.exports = seedDemoData;
