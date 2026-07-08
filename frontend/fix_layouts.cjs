const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');

const processDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes('DashboardLayout')) {
                // Remove import
                content = content.replace(/import\s+DashboardLayout\s+from\s+['"].*?DashboardLayout['"];?\n?/, '');
                
                // Replace opening tags
                // We want to remove <DashboardLayout ...> and </DashboardLayout>
                // Sometimes it's <DashboardLayout title="Something">
                
                content = content.replace(/<DashboardLayout[^>]*>/g, '<>');
                content = content.replace(/<\/DashboardLayout>/g, '</>');
                
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
};

processDirectory(featuresDir);
console.log("Finished removing DashboardLayout from components.");
