const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const userManagementRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const { promisePool } = require('./config/database');
const { createDatabase } = require('./config/database');
const { setupDatabase } = require('./config/setupDatabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});


// Start server
app.listen(PORT, async () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  
  // Setup database and create admin user
  await createDatabase();
  await setupDatabase();
});
