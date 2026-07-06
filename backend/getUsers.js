require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/user.model');

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
        const users = await User.find({}, 'name email role');
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
run();
