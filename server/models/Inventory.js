const { promisePool } = require('../config/database');

class Inventory {
  // Auto-create inventory tables if they don't exist
  static async ensureTables() {
    try {
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

      // Create stock movements table
      await promisePool.query(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
          inventory_id BIGINT UNSIGNED NOT NULL,
          variant_id BIGINT UNSIGNED NULL,
          movement_type ENUM('in', 'out', 'adjustment', 'transfer', 'return') NOT NULL,
          quantity_change INT NOT NULL,
          quantity_before INT UNSIGNED NOT NULL,
          quantity_after INT UNSIGNED NOT NULL,
          reference_type ENUM('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer') NULL,
          reference_id BIGINT UNSIGNED NULL,
          reason VARCHAR(255) NULL,
          notes TEXT NULL,
          user_id BIGINT UNSIGNED NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
          FOREIGN KEY (variant_id) REFERENCES inventory_variants(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES dashboard_users(id) ON DELETE SET NULL,
          INDEX idx_inventory_id (inventory_id),
          INDEX idx_movement_type (movement_type),
          INDEX idx_created_at (created_at)
        )
      `);

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

      console.log('✅ Inventory tables ensured');
    } catch (error) {
      console.error('❌ Error ensuring inventory tables:', error);
    }
  }
  // Create new inventory item
  static async create(inventoryData) {
    // Ensure tables exist before creating
    await this.ensureTables();

    const {
      name, description, sku, barcode, brand, style, material, fit_type,
      cost_price, selling_price, discount_price, total_quantity,
      minimum_stock_level, status, is_featured, is_visible, category,
      tags, images, thumbnail_url, meta_title, meta_description, keywords,
      product_attributes, custom_fields, supplier_info, shipping_info
    } = inventoryData;

    const [result] = await promisePool.query(
      `INSERT INTO inventory (
        name, description, sku, barcode, brand, style, material, fit_type,
        cost_price, selling_price, discount_price, total_quantity, available_quantity,
        minimum_stock_level, status, is_featured, is_visible, category,
        tags, images, thumbnail_url, meta_title, meta_description, keywords,
        product_attributes, custom_fields, supplier_info, shipping_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, sku, barcode, brand, style, material, fit_type,
        cost_price, selling_price, discount_price, total_quantity, total_quantity, // available_quantity = total_quantity initially
        minimum_stock_level, status, is_featured, is_visible, category,
        JSON.stringify(tags || []),
        JSON.stringify(images || []),
        thumbnail_url, meta_title, meta_description,
        JSON.stringify(keywords || []),
        JSON.stringify(product_attributes || {}),
        JSON.stringify(custom_fields || {}),
        JSON.stringify(supplier_info || {}),
        JSON.stringify(shipping_info || {})
      ]
    );

    return this.findById(result.insertId);
  }

  // Find inventory item by ID
  static async findById(id) {
    const [rows] = await promisePool.query(`
      SELECT i.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', iv.id,
                 'variant_name', iv.variant_name,
                 'variant_sku', iv.variant_sku,
                 'size', iv.size,
                 'color', iv.color,
                 'color_code', iv.color_code,
                 'quantity', iv.quantity,
                 'variant_selling_price', iv.variant_selling_price,
                 'is_active', iv.is_active
               )
             ) as variants
      FROM inventory i
      LEFT JOIN inventory_variants iv ON i.id = iv.inventory_id AND iv.is_active = 1
      WHERE i.id = ? AND i.deleted_at IS NULL
      GROUP BY i.id
    `, [id]);

    return this.parseJsonFields(rows[0]);
  }

  // Find all inventory items with filtering
  static async findAll(filters = {}) {
    // Ensure tables exist before querying
    await this.ensureTables();

    let query = `
      SELECT i.*, 
             COUNT(iv.id) as variant_count,
             SUM(iv.quantity) as total_variant_quantity
      FROM inventory i
      LEFT JOIN inventory_variants iv ON i.id = iv.inventory_id AND iv.is_active = 1
      WHERE i.deleted_at IS NULL
    `;
    
    const params = [];

    // Filter by status
    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }

    // Filter by category
    if (filters.category) {
      query += ' AND i.category = ?';
      params.push(filters.category);
    }

    // Search by name, SKU, or description
    if (filters.search) {
      query += ' AND (i.name LIKE ? OR i.sku LIKE ? OR i.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by low stock
    if (filters.low_stock) {
      query += ' AND i.available_quantity <= i.minimum_stock_level';
    }

    // Group by inventory item
    query += ' GROUP BY i.id';

    // Order and pagination
    query += ' ORDER BY i.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const [rows] = await promisePool.query(query, params);
    return rows.map(item => this.parseJsonFields(item));
  }

  // Update inventory item
  static async update(id, updateData) {
    const {
      name, description, sku, barcode, brand, style, material, fit_type,
      cost_price, selling_price, discount_price, minimum_stock_level,
      status, is_featured, is_visible, category, tags, images, thumbnail_url,
      meta_title, meta_description, keywords, product_attributes,
      custom_fields, supplier_info, shipping_info
    } = updateData;

    await promisePool.query(`
      UPDATE inventory SET 
        name = ?, description = ?, sku = ?, barcode = ?, brand = ?, style = ?,
        material = ?, fit_type = ?, cost_price = ?, selling_price = ?, discount_price = ?,
        minimum_stock_level = ?, status = ?, is_featured = ?, is_visible = ?,
        category = ?, tags = ?, images = ?, thumbnail_url = ?, meta_title = ?,
        meta_description = ?, keywords = ?, product_attributes = ?, custom_fields = ?,
        supplier_info = ?, shipping_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `, [
      name, description, sku, barcode, brand, style, material, fit_type,
      cost_price, selling_price, discount_price, minimum_stock_level,
      status, is_featured, is_visible, category,
      JSON.stringify(tags || []),
      JSON.stringify(images || []),
      thumbnail_url, meta_title, meta_description,
      JSON.stringify(keywords || []),
      JSON.stringify(product_attributes || {}),
      JSON.stringify(custom_fields || {}),
      JSON.stringify(supplier_info || {}),
      JSON.stringify(shipping_info || {}),
      id
    ]);

    return this.findById(id);
  }

  // Update stock quantity
  static async updateStock(id, quantity, userId = null, reason = 'Manual adjustment') {
    const item = await this.findById(id);
    if (!item) throw new Error('Inventory item not found');

    const quantityChange = quantity - item.available_quantity;
    
    // Update inventory quantity
    await promisePool.query(`
      UPDATE inventory 
      SET available_quantity = ?, total_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [quantity, quantity, id]);

    // Record stock movement
    await promisePool.query(`
      INSERT INTO stock_movements (
        inventory_id, movement_type, quantity_change, quantity_before, 
        quantity_after, reference_type, reason, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      quantityChange > 0 ? 'in' : 'out',
      quantityChange,
      item.available_quantity,
      quantity,
      'adjustment',
      reason,
      userId
    ]);

    return this.findById(id);
  }

  // Soft delete inventory item
  static async delete(id) {
    await promisePool.query(`
      UPDATE inventory 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);

    return true;
  }

  // Get categories
  static async getCategories() {
    const [rows] = await promisePool.query(`
      SELECT * FROM inventory_categories 
      WHERE is_active = 1 
      ORDER BY display_order, name
    `);
    return rows;
  }

  // Get low stock items
  static async getLowStockItems() {
    const [rows] = await promisePool.query(`
      SELECT * FROM inventory 
      WHERE available_quantity <= minimum_stock_level 
      AND status = 'active' 
      AND deleted_at IS NULL
      ORDER BY available_quantity ASC
    `);
    return rows.map(item => this.parseJsonFields(item));
  }

  // Get stock movements for an item
  static async getStockMovements(inventoryId, limit = 50) {
    const [rows] = await promisePool.query(`
      SELECT sm.*, u.first_name, u.last_name, u.email
      FROM stock_movements sm
      LEFT JOIN dashboard_users u ON sm.user_id = u.id
      WHERE sm.inventory_id = ?
      ORDER BY sm.created_at DESC
      LIMIT ?
    `, [inventoryId, limit]);
    return rows;
  }

  // Helper method to parse JSON fields
  static parseJsonFields(item) {
    if (!item) return null;
    
    try {
      // Parse JSON fields
      item.tags = item.tags ? JSON.parse(item.tags) : [];
      item.images = item.images ? JSON.parse(item.images) : [];
      item.keywords = item.keywords ? JSON.parse(item.keywords) : [];
      item.product_attributes = item.product_attributes ? JSON.parse(item.product_attributes) : {};
      item.custom_fields = item.custom_fields ? JSON.parse(item.custom_fields) : {};
      item.supplier_info = item.supplier_info ? JSON.parse(item.supplier_info) : {};
      item.shipping_info = item.shipping_info ? JSON.parse(item.shipping_info) : {};
      
      // Parse variants if present
      if (item.variants) {
        try {
          item.variants = JSON.parse(`[${item.variants}]`);
        } catch (e) {
          item.variants = [];
        }
      }
      
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      // Set defaults if parsing fails
      item.tags = [];
      item.images = [];
      item.keywords = [];
      item.product_attributes = {};
      item.custom_fields = {};
      item.supplier_info = {};
      item.shipping_info = {};
      item.variants = [];
    }
    
    return item;
  }
}

module.exports = Inventory;
