require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/user.model.js');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const existing = await User.findOne({ email: 'admin@enterprisewfm.com' });
        if (existing) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        await User.create({
            email: 'admin@enterprisewfm.com',
            password: 'Password123!', // Will be hashed automatically by pre-save hook
            role: 'SUPER_ADMIN'
        });

        console.log('Successfully created Super Admin: admin@enterprisewfm.com / Password123!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
};

seedAdmin();
