import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration: Add dynamic_content table for managing app texts/promos
 */
async function addDynamicContentTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'canzey-app-db',
    });

    console.log('🔄 Creating dynamic_content table...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dynamic_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content_type ENUM('promo', 'ad', 'notification', 'banner', 'popup', 'other') DEFAULT 'promo',
        status ENUM('active', 'inactive') DEFAULT 'active',
        priority INT DEFAULT 0,
        start_date DATETIME,
        end_date DATETIME,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key_name (key_name),
        INDEX idx_status (status),
        INDEX idx_type (content_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ dynamic_content table created successfully!');

    // Insert sample data
    await connection.execute(`
      INSERT IGNORE INTO dynamic_content (key_name, title, description, content_type, status, priority) VALUES
      ('home_welcome_banner', 'Welcome to Canzey!', 'Get 20% off on your first order. Use code: WELCOME20', 'banner', 'active', 1),
      ('checkout_promo_text', 'Limited Time Offer', 'Free shipping on orders above $50!', 'promo', 'active', 2),
      ('app_maintenance_notice', 'Maintenance Notice', 'We will be performing scheduled maintenance on Sunday 2 AM - 4 AM EST', 'notification', 'inactive', 0)
    `);

    console.log('✅ Sample data inserted!');

    await connection.end();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDynamicContentTable();
