const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const { promisePool, createDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

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

// Auto-create database and tables on server start
const setupDatabase = async () => {
  try {
    // 1. Create database if it doesn't exist
    await createDatabase();
    
    // 2. Create users table directly
    console.log('🔧 Creating users table...');
    
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        approved_by INT NULL,
        approved_at TIMESTAMP NULL
      )
    `);
    
    console.log('✅ Users table created successfully');
    
    // 3. Create admin user
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
};

// Create admin user function
const createAdminUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if admin user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@canzey.com']
    );

    if (existingUsers.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Insert admin user with approved status
      await promisePool.query(
        'INSERT INTO users (email, password, name, role, status, is_active, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)',
        ['admin@canzey.com', hashedPassword, 'Admin User', 'admin', 'approved', true]
      );

      console.log('🔐 Default admin user created:');
      console.log('   📧 Email: admin@canzey.com');
      console.log('   🔑 Password: 123456');
      console.log('   🎯 Role: admin');
      console.log('   ✅ Status: approved');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  
  // Setup database and create admin user
  await setupDatabase();
});
