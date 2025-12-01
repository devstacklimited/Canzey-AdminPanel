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
        password_hash VARCHAR(255),
        profile_url VARCHAR(500),
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT NULL,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        address VARCHAR(500),
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        firebase_uid VARCHAR(255) UNIQUE,
        firebase_email VARCHAR(255),
        auth_method ENUM('local', 'firebase') DEFAULT 'local',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ customers table ready');

    // Create campaigns table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        credits_per_ticket INT NOT NULL DEFAULT 0,
        max_tickets_per_user INT DEFAULT NULL,
        status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
        start_at TIMESTAMP NULL,
        end_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_dates (start_at, end_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ campaigns table ready');

    // Create campaign_tickets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS campaign_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        campaign_id INT NOT NULL,
        customer_id INT NOT NULL,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        credits_earned INT NOT NULL,
        status ENUM('active', 'used', 'expired') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_campaign_id (campaign_id),
        INDEX idx_ticket_number (ticket_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ campaign_tickets table ready');

    // Create customer_credits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customer_credits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        ticket_id INT,
        credits INT NOT NULL,
        type ENUM('earned', 'spent', 'expired') DEFAULT 'earned',
        description VARCHAR(255),
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES campaign_tickets(id) ON DELETE SET NULL,
        INDEX idx_customer_id (customer_id),
        INDEX idx_expires_at (expires_at),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ customer_credits table ready');

    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        sku VARCHAR(100) UNIQUE,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        sale_price DECIMAL(10,2) DEFAULT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        category VARCHAR(100) DEFAULT NULL,
        sub_category VARCHAR(100) DEFAULT NULL,
        for_gender VARCHAR(20) DEFAULT NULL,
        is_customized BOOLEAN DEFAULT FALSE,
        tags VARCHAR(500) DEFAULT NULL,
        main_image_url VARCHAR(500),
        status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sku (sku),
        INDEX idx_status (status),
        INDEX idx_slug (slug),
        INDEX idx_stock (stock_quantity),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ products table ready');

    // Create product_images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_is_primary (is_primary)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ product_images table ready');

    // Create product_colors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        color_name VARCHAR(50) NOT NULL,
        color_code VARCHAR(7) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ product_colors table ready');

    // Create product_sizes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        size VARCHAR(20) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ product_sizes table ready');

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
