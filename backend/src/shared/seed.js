require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_workforce')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => { console.error('❌ Connection failed:', err); process.exit(1); });

// Define User Schema inline (to avoid circular imports)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'EMPLOYEE' },
    employeeId: { type: String, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Create seed users for each role
        const users = [
            { email: 'superadmin@ewm.com',  password: hashedPassword, role: 'SUPER_ADMIN' },
            { email: 'hradmin@ewm.com',      password: hashedPassword, role: 'HR_MANAGER' },
            { email: 'manager@ewm.com',      password: hashedPassword, role: 'MANAGER' },
            { email: 'finance@ewm.com',      password: hashedPassword, role: 'FINANCE' },
            { email: 'employee@ewm.com',     password: hashedPassword, role: 'EMPLOYEE' },
        ];

        await User.insertMany(users);

        console.log('\n✅ Seed users created successfully!\n');
        console.log('=================================================');
        console.log('   ROLE            EMAIL                PASSWORD');
        console.log('-------------------------------------------------');
        console.log('   Super Admin     superadmin@ewm.com   Admin@123');
        console.log('   HR Manager      hradmin@ewm.com      Admin@123');
        console.log('   Manager         manager@ewm.com      Admin@123');
        console.log('   Finance         finance@ewm.com      Admin@123');
        console.log('   Employee        employee@ewm.com     Admin@123');
        console.log('=================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedUsers();
