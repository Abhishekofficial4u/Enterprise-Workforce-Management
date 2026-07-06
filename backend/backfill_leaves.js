const mongoose = require('mongoose');
const Employee = require('./src/modules/hr/employee.model');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_workforce');
    const employees = await Employee.find({}).lean();
    
    let count = 0;
    for (let emp of employees) {
        if (!emp.leaveBalance || emp.leaveBalance.casual === undefined) {
            await Employee.updateOne({ _id: emp._id }, {
                $set: {
                    leaveBalance: {
                        casual: 15,
                        sick: 10,
                        earned: 15
                    }
                }
            });
            count++;
        }
    }
    console.log(`Backfilled leaveBalance for ${count} employees.`);
    process.exit(0);
}
run();
