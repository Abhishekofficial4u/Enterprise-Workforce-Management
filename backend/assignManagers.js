const mongoose = require('mongoose');
const Employee = require('./src/modules/hr/employee.model.js');
mongoose.connect('mongodb://localhost:27017/enterprise_workforce').then(async () => {
    const employees = await Employee.find({ manager: null, email: { $nin: ['admin@ewm.com', 'matthew.anderson117@ewm.com', 'mary.jackson38@ewm.com'] } });
    let matthewCount = 0;
    let maryCount = 0;

    const matthew = await Employee.findOne({ email: 'matthew.anderson117@ewm.com' });
    const mary = await Employee.findOne({ email: 'mary.jackson38@ewm.com' });

    if (matthew && mary) {
        for (let i = 0; i < employees.length; i++) {
            if (i % 2 === 0 && matthewCount < 8) {
                employees[i].manager = matthew._id;
                matthewCount++;
                await employees[i].save();
            } else if (i % 2 !== 0 && maryCount < 5) {
                employees[i].manager = mary._id;
                maryCount++;
                await employees[i].save();
            }
        }
        console.log('Assigned', matthewCount, 'to Matthew and', maryCount, 'to Mary.');
    } else {
        console.log('Matthew or Mary Employee profile not found.');
    }
    process.exit(0);
});
