import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Setup database - create database, tables, and seed admin user
 */
export async function setupDatabase() {
  try {
    // First, connect without database to create it
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    const dbName = process.env.DB_NAME || 'canzey-app-db';

    // Create database if it doesn't exist
    await tempConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${dbName}' ready`);

    await tempConnection.end();

    // Now connect to the database and create tables
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: dbName,
    });

    // Create admin_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'manager', 'staff') DEFAULT 'staff',
        profile_url VARCHAR(500),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ admin_users table ready');

    // Create customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        profile_url VARCHAR(500),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        address VARCHAR(500),
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ customers table ready');

    // Create sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_user_id INT NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ sessions table ready');

    // Seed master admin user
    await seedMasterAdmin(connection);

    await connection.end();
    console.log('✅ Database setup complete');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    throw error;
  }
}

/**
 * Seed master admin user if it doesn't exist
 */
async function seedMasterAdmin(connection) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@canzey.com';
    const adminPassword = process.env.ADMIN_PASS || 'Admin@123456';

    // Check if admin already exists
    const [rows] = await connection.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      [adminEmail]
    );

    if (rows.length > 0) {
      console.log('✅ Master admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create master admin
    await connection.execute(
      `INSERT INTO admin_users 
       (first_name, last_name, email, phone_number, password_hash, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Master', 'Admin', adminEmail, '+1-000-000-0000', hashedPassword, 'super_admin', 'active']
    );

    console.log('✅ Master admin user created');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log('   ⚠️  Change password after first login!');

  } catch (error) {
    console.error('❌ Error seeding master admin:', error.message);
    throw error;
  }
}
