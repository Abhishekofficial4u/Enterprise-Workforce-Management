require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Asset = require('./src/modules/assets/asset.model');
const Employee = require('./src/modules/hr/employee.model');

async function seedAssets() {
    try {
        await mongoose.connect('mongodb://localhost:27017/enterprise_workforce');
        console.log('Connected to DB...');

        // Clear existing assets if needed
        await Asset.deleteMany({});
        console.log('Cleared existing assets.');

        // Get a few employees to assign assets to
        const employees = await Employee.find().limit(3);
        
        const assets = [
            {
                name: 'MacBook Pro M3 Max - 32GB',
                category: 'Hardware',
                status: 'Available',
                purchaseDate: new Date('2024-01-15'),
                cost: 2999
            },
            {
                name: 'Dell UltraSharp 32 4K USB-C Monitor',
                category: 'Hardware',
                status: 'Available',
                purchaseDate: new Date('2024-02-10'),
                cost: 850
            },
            {
                name: 'Adobe Creative Cloud All Apps',
                category: 'Software',
                status: 'Available',
                purchaseDate: new Date('2024-03-01'),
                cost: 599.88
            },
            {
                name: 'Figma Organization License',
                category: 'Software',
                status: 'Available',
                purchaseDate: new Date('2024-03-15'),
                cost: 540
            },
            {
                name: 'Logitech MX Master 3S Wireless Mouse',
                category: 'Accessory',
                status: 'Available',
                purchaseDate: new Date('2024-04-20'),
                cost: 99.99
            },
            {
                name: 'Keychron K8 Pro Mechanical Keyboard',
                category: 'Accessory',
                status: 'Available',
                purchaseDate: new Date('2024-04-25'),
                cost: 115
            },
            {
                name: 'Lenovo ThinkPad X1 Carbon Gen 11',
                category: 'Hardware',
                status: 'Under Maintenance',
                purchaseDate: new Date('2023-11-05'),
                cost: 1899
            },
            {
                name: 'Apple Magic Trackpad',
                category: 'Accessory',
                status: 'Retired',
                purchaseDate: new Date('2021-06-12'),
                cost: 129
            }
        ];

        // Insert baseline assets one by one to trigger pre-save hook for assetTag
        const inserted = [];
        for (const assetData of assets) {
            const newAsset = new Asset(assetData);
            await newAsset.save();
            inserted.push(newAsset);
        }
        console.log(`Inserted ${inserted.length} unassigned assets.`);

        // If we have employees, assign a few
        if (employees.length > 0) {
            const emp1 = employees[0]._id;
            const emp2 = employees.length > 1 ? employees[1]._id : emp1;

            await Asset.findByIdAndUpdate(inserted[0]._id, { status: 'Assigned', assignedTo: emp1 });
            await Asset.findByIdAndUpdate(inserted[2]._id, { status: 'Assigned', assignedTo: emp1 });
            await Asset.findByIdAndUpdate(inserted[1]._id, { status: 'Assigned', assignedTo: emp2 });
            await Asset.findByIdAndUpdate(inserted[3]._id, { status: 'Assigned', assignedTo: emp2 });

            console.log('Assigned 4 assets to employees.');
        }

        console.log('Done seeding assets!');
    } catch (e) {
        console.error('Error seeding assets:', e);
    } finally {
        mongoose.disconnect();
    }
}

seedAssets();
