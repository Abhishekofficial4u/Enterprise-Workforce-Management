require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./shared/db');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Enterprise Workforce Management API is running' });
});

// Mount Routes
const authRoutes = require('./modules/auth/auth.routes');
const hrRoutes = require('./modules/hr/hr.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hr', hrRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
