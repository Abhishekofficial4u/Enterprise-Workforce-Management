const cron = require('node-cron');
const Employee = require('../modules/hr/employee.model');
const Announcement = require('../modules/org/announcement.model');

// Run every day at 12:05 AM
const initCronJobs = () => {
    cron.schedule('5 0 * * *', async () => {
        console.log('⏳ Running daily HR automation jobs...');
        
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1; // 1-12
            const currentDay = today.getDate(); // 1-31

            // 1. Birthday Automation
            // We need to find employees whose DOB matches today. 
            // Assuming we will add DOB to Employee schema, or we can check joiningDate for Work Anniversaries right now.
            const allEmployees = await Employee.find({ status: 'Active' });
            
            for (const emp of allEmployees) {
                // Check Work Anniversary
                if (emp.joiningDate) {
                    const joinDate = new Date(emp.joiningDate);
                    if (joinDate.getMonth() + 1 === currentMonth && joinDate.getDate() === currentDay && joinDate.getFullYear() !== today.getFullYear()) {
                        const years = today.getFullYear() - joinDate.getFullYear();
                        
                        // Check if announcement already exists to avoid duplicates
                        const existing = await Announcement.findOne({
                            relatedEmployee: emp._id,
                            type: 'Work Anniversary',
                            eventDate: {
                                $gte: new Date(today.setHours(0,0,0,0)),
                                $lte: new Date(today.setHours(23,59,59,999))
                            }
                        });

                        if (!existing) {
                            await Announcement.create({
                                title: `Happy ${years} Year Work Anniversary, ${emp.name}! 🎉`,
                                content: `Join us in congratulating ${emp.name} on reaching this amazing milestone with the company!`,
                                type: 'Work Anniversary',
                                priority: 'Normal',
                                eventDate: new Date(),
                                relatedEmployee: emp._id
                            });
                            console.log(`✔️ Created Work Anniversary announcement for ${emp.name}`);
                        }
                    }
                }
                
                // TODO: Add Birthday automation once DOB is formally tracked
            }

            console.log('✅ Daily HR automation completed.');
        } catch (error) {
            console.error('❌ Error running daily HR automation:', error);
        }
    });
};

module.exports = initCronJobs;
