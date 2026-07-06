const mongoose = require('mongoose');
const User = require('./src/modules/auth/user.model');
const Employee = require('./src/modules/hr/employee.model');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
    const users = await User.find({ role: 'EMPLOYEE' }).limit(5);
    for (let u of users) {
        const emp = await Employee.findOne({ email: u.email });
        console.log(`User: ${u.email}, Employee linked: ${!!emp}`);
    }
    process.exit(0);
}
test();
