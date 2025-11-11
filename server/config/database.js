const mysql = require('mysql2');
require('dotenv').config();

// First connect without database to create it if needed
const createDatabase = async () => {
  try {
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    const tempConnection = tempPool.promise();
    
    // Check if database exists
    const [databases] = await tempConnection.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'canzey_dashboard']);
    
    if (databases.length === 0) {
      // Create database if it doesn't exist
      await tempConnection.query(
        `CREATE DATABASE ${process.env.DB_NAME || 'canzey_dashboard'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }
    
    tempPool.end();
    
  } catch (error) {
    console.error('❌ Error checking/creating database:', error.message);
    process.exit(1);
  }
};

// Create connection pool with the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canzey_dashboard',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL database:', err.message);
    return;
  }
  console.log('✅ MySQL Database connected successfully');
  connection.release();
});

module.exports = { promisePool, createDatabase };
