const { promisePool } = require('./database');

// Create inventory database tables
const createInventoryTables = async () => {
  try {
    console.log('🔧 Creating inventory tables...');
    
    // Create inventory table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        barcode VARCHAR(100) NULL,
        brand VARCHAR(100) NULL,
        style VARCHAR(100) NULL,
        material VARCHAR(100) NULL,
        fit_type ENUM('regular', 'slim', 'oversized', 'fitted') DEFAULT 'regular',
        cost_price DECIMAL(10,2) NULL,
        selling_price DECIMAL(10,2) NOT NULL,
        discount_price DECIMAL(10,2) NULL,
        total_quantity INT UNSIGNED DEFAULT 0,
        available_quantity INT UNSIGNED DEFAULT 0,
        reserved_quantity INT UNSIGNED DEFAULT 0,
        minimum_stock_level INT UNSIGNED DEFAULT 5,
        status ENUM('active', 'inactive', 'discontinued', 'out_of_stock') DEFAULT 'active',
        is_featured BOOLEAN DEFAULT FALSE,
        is_visible BOOLEAN DEFAULT TRUE,
        category VARCHAR(100) NULL,
        tags JSON NULL,
        images JSON NULL,
        thumbnail_url VARCHAR(500) NULL,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        keywords JSON NULL,
        product_attributes JSON NULL,
        custom_fields JSON NULL,
        supplier_info JSON NULL,
        shipping_info JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_sku (sku),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create variants table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS inventory_variants (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        inventory_id BIGINT UNSIGNED NOT NULL,
        variant_name VARCHAR(100) NOT NULL,
        variant_sku VARCHAR(100) UNIQUE NOT NULL,
        size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NULL,
        color VARCHAR(50) NULL,
        color_code VARCHAR(7) NULL,
        variant_cost_price DECIMAL(10,2) NULL,
        variant_selling_price DECIMAL(10,2) NULL,
        quantity INT UNSIGNED DEFAULT 0,
        reserved_quantity INT UNSIGNED DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        variant_attributes JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
        INDEX idx_inventory_id (inventory_id),
        INDEX idx_size (size),
        INDEX idx_color (color)
      )
    `);

    // Stock movements table removed - not needed for simple inventory

    // Create categories table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS inventory_categories (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        parent_id BIGINT UNSIGNED NULL,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        category_attributes JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES inventory_categories(id) ON DELETE SET NULL,
        INDEX idx_parent_id (parent_id),
        INDEX idx_slug (slug)
      )
    `);

    // Insert default categories
    await promisePool.query(`
      INSERT IGNORE INTO inventory_categories (name, slug, description) VALUES
      ('T-Shirts', 't-shirts', 'All types of t-shirts'),
      ('Men T-Shirts', 'men-t-shirts', 'T-shirts for men'),
      ('Women T-Shirts', 'women-t-shirts', 'T-shirts for women'),
      ('Kids T-Shirts', 'kids-t-shirts', 'T-shirts for children'),
      ('Promotional', 'promotional', 'Promotional and branded t-shirts')
    `);

    console.log('✅ Inventory tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating inventory tables:', error);
    throw error;
  }
};

module.exports = { createInventoryTables };
