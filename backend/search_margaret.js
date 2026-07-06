const mongoose = require('mongoose');
const Employee = require('./src/modules/hr/employee.model');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
    const emp = await Employee.find({ name: /Margaret/i });
    console.log(emp.map(e => ({ name: e.name, email: e.email })));
    process.exit(0);
}
test();
