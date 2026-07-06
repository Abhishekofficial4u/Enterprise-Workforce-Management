require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Required for Socket.io
const connectDB = require('./shared/db');
const socketModule = require('./shared/socket'); // Import socket module

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
socketModule.init(server);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Basic Route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Enterprise Workforce Management API is running' });
});

// Mount Routes
const authRoutes = require('./modules/auth/auth.routes');
const hrRoutes = require('./modules/hr/hr.routes');
const timePayrollRoutes = require('./modules/time-payroll/time-payroll.routes');
const orgRoutes = require('./modules/org/org.routes');
const projectRoutes = require('./modules/projects/project.routes');
const recruitmentRoutes = require('./modules/recruitment/recruitment.routes');
const performanceRoutes = require('./modules/performance/performance.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const helpdeskRoutes = require('./modules/helpdesk/helpdesk.routes');
const assetRoutes = require('./modules/assets/asset.routes');
const reportRoutes = require('./modules/reports/report.routes');
const aiRoutes = require('./modules/ai/ai.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/time-payroll', timePayrollRoutes);
app.use('/api/v1/org', orgRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/helpdesk', helpdeskRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
