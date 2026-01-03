import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration: Add orders system tables
 */
async function addOrdersTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'canzey-app-db',
    });

    console.log('🔄 Creating orders tables...');

    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_transaction_id VARCHAR(255),
        order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_order_number (order_number),
        INDEX idx_customer_id (customer_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_order_status (order_status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ orders table created!');

    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        campaign_id INT,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(500),
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id),
        INDEX idx_campaign_id (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ order_items table created!');

    // Update campaign_tickets table - add order-related columns
    console.log('🔄 Updating campaign_tickets table...');
    
    try {
      await connection.execute(`
        ALTER TABLE campaign_tickets 
        ADD COLUMN order_id INT DEFAULT NULL AFTER customer_id,
        ADD COLUMN product_id INT DEFAULT NULL AFTER order_id,
        ADD COLUMN source ENUM('purchase', 'direct') DEFAULT 'direct' AFTER product_id
      `);
      console.log('✅ Added order_id, product_id, source columns to campaign_tickets');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Columns already exist in campaign_tickets, skipping...');
      } else {
        throw err;
      }
    }

    // Add foreign keys if they don't exist
    try {
      await connection.execute(`
        ALTER TABLE campaign_tickets
        ADD CONSTRAINT fk_campaign_tickets_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key for order_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Foreign key already exists, skipping...');
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE campaign_tickets
        ADD CONSTRAINT fk_campaign_tickets_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key for product_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Foreign key already exists, skipping...');
      }
    }

    await connection.end();
    console.log('🎉 Orders system migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addOrdersTables();
