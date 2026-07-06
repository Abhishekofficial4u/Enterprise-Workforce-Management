require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Performance = require('./src/modules/performance/performance.model');

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
        const review = new Performance({
            employeeId: new mongoose.Types.ObjectId(),
            reviewerId: new mongoose.Types.ObjectId(),
            reviewCycle: 'Q1',
            year: 2026,
            kpis: {
                qualityOfWork: 4,
                communication: 4,
                punctuality: 4,
                teamwork: 4,
                initiative: 4
            },
            feedback: 'Good'
        });
        await review.save();
        console.log('Saved successfully');
        console.log('Score:', review.overallScore);
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
run();
