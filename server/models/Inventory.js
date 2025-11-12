const { promisePool } = require('../config/database');
const { createInventoryTables } = require('../config/inventorySetup');

class Inventory {
  // Create new inventory item
  static async create(inventoryData) {
    // Ensure tables exist before creating
    await createInventoryTables();

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
    await createInventoryTables();

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
      cost_price, selling_price, discount_price, total_quantity, available_quantity,
      minimum_stock_level, status, is_featured, is_visible, category, tags, images, thumbnail_url,
      meta_title, meta_description, keywords, product_attributes,
      custom_fields, supplier_info, shipping_info
    } = updateData;

    await promisePool.query(`
      UPDATE inventory SET 
        name = ?, description = ?, sku = ?, barcode = ?, brand = ?, style = ?,
        material = ?, fit_type = ?, cost_price = ?, selling_price = ?, discount_price = ?,
        total_quantity = ?, available_quantity = ?, minimum_stock_level = ?, status = ?, 
        is_featured = ?, is_visible = ?, category = ?, tags = ?, images = ?, 
        thumbnail_url = ?, meta_title = ?, meta_description = ?, keywords = ?, 
        product_attributes = ?, custom_fields = ?, supplier_info = ?, shipping_info = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `, [
      name, description, sku, barcode, brand, style, material, fit_type,
      cost_price, selling_price, discount_price, total_quantity, available_quantity,
      minimum_stock_level, status, is_featured, is_visible, category,
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
