const Inventory = require('../models/Inventory');
const { promisePool } = require('../config/database');

// Check if inventory tables exist
const checkTablesExist = async () => {
  try {
    const [tables] = await promisePool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('inventory', 'inventory_variants', 'stock_movements', 'inventory_categories')
    `);
    return tables[0].count >= 4;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
};

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const { status, category, search, low_stock, limit, offset } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (low_stock === 'true') filters.low_stock = true;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const items = await Inventory.findAll(filters);
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
};

// Get inventory item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
};

// Create new inventory item
exports.createInventory = async (req, res) => {
  try {
    // Check if tables exist before creating
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log('🔧 Inventory tables not found, creating them...');
      // Tables will be created automatically by the Inventory.create() method
    }
    
    const inventoryData = req.body;
    
    // Validate required fields
    if (!inventoryData.name || !inventoryData.sku || !inventoryData.selling_price) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, and selling price are required'
      });
    }
    
    const newItem = await Inventory.create(inventoryData);
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    // Handle duplicate SKU error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists. Please use a unique SKU.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedItem = await Inventory.update(id, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    // Handle duplicate SKU error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists. Please use a unique SKU.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Inventory.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Inventory.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get low stock items
exports.getLowStock = async (req, res) => {
  try {
    const items = await Inventory.getLowStockItems();
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items',
      error: error.message
    });
  }
};

// Stock movements method removed - table not needed

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    const { promisePool } = require('../config/database');
    
    // Get various statistics
    const [totalItems] = await promisePool.query(`
      SELECT COUNT(*) as total FROM inventory WHERE deleted_at IS NULL
    `);
    
    const [activeItems] = await promisePool.query(`
      SELECT COUNT(*) as active FROM inventory WHERE status = 'active' AND deleted_at IS NULL
    `);
    
    const [lowStockItems] = await promisePool.query(`
      SELECT COUNT(*) as low_stock FROM inventory 
      WHERE available_quantity <= minimum_stock_level AND status = 'active' AND deleted_at IS NULL
    `);
    
    const [totalValue] = await promisePool.query(`
      SELECT SUM(available_quantity * selling_price) as total_value FROM inventory 
      WHERE status = 'active' AND deleted_at IS NULL
    `);
    
    const [categoryStats] = await promisePool.query(`
      SELECT category, COUNT(*) as count, SUM(available_quantity) as total_quantity
      FROM inventory 
      WHERE deleted_at IS NULL 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    res.json({
      success: true,
      data: {
        total_items: totalItems[0].total,
        active_items: activeItems[0].active,
        low_stock_items: lowStockItems[0].low_stock,
        total_inventory_value: parseFloat(totalValue[0].total_value || 0),
        category_breakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory statistics',
      error: error.message
    });
  }
};
