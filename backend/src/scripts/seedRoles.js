require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../modules/auth/role.model');
const User = require('../modules/auth/user.model');

if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Connect to DB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

const seedRoles = async () => {
    try {
        console.log('Clearing existing roles...');
        await Role.deleteMany();

        console.log('Seeding initial roles...');

        const rolesData = [
            {
                name: 'SUPER_ADMIN',
                description: 'Full system access',
                permissions: [
                    'manage_users', 'manage_roles', 'view_all_data', 'manage_employees', 
                    'approve_payroll', 'manage_projects', 'view_reports', 'manage_assets', 
                    'manage_helpdesk', 'manage_recruitment', 'view_performance', 'manage_payroll', 'manage_attendance'
                ]
            },
            {
                name: 'HR_MANAGER',
                description: 'Human Resources Manager',
                permissions: [
                    'manage_employees', 'view_employees', 'manage_attendance', 'view_reports', 'manage_recruitment'
                ]
            },
            {
                name: 'FINANCE',
                description: 'Finance Manager',
                permissions: [
                    'view_employees', 'manage_payroll', 'approve_payroll', 'view_reports'
                ]
            },
            {
                name: 'MANAGER',
                description: 'Project/Team Manager',
                permissions: [
                    'view_team', 'manage_projects', 'approve_leave', 'view_performance'
                ]
            },
            {
                name: 'TEAM_LEAD',
                description: 'Team Leader',
                permissions: [
                    'view_team', 'manage_tasks', 'approve_leave'
                ]
            },
            {
                name: 'EMPLOYEE',
                description: 'Standard Employee',
                permissions: [
                    'view_own_profile', 'submit_leave', 'view_own_payroll', 'submit_helpdesk_ticket'
                ]
            }
        ];

        const createdRoles = await Role.insertMany(rolesData);
        console.log(`Created ${createdRoles.length} roles.`);

        // Create a mapping for quick lookup
        const roleMap = {};
        createdRoles.forEach(r => {
            roleMap[r.name] = r._id;
        });

        console.log('Migrating existing users...');
        const users = await User.find();
        
        let updateCount = 0;
        for (const user of users) {
            if (user.role && roleMap[user.role]) {
                // If they don't already have roles assigned, or we want to overwrite
                user.roles = [roleMap[user.role]];
                await user.save();
                updateCount++;
            }
        }
        
        console.log(`Successfully migrated ${updateCount} users to the new RBAC system.`);
        process.exit();
    } catch (error) {
        console.error('Error with role seeding:', error);
        process.exit(1);
    }
};

seedRoles();
