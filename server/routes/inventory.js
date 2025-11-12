const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Get inventory statistics (dashboard)
router.get('/stats', requireRole(['admin', 'manager']), inventoryController.getInventoryStats);

// Get all inventory items
router.get('/', requireRole(['admin', 'manager', 'staff']), inventoryController.getAllInventory);

// Get categories
router.get('/categories', requireRole(['admin', 'manager', 'staff']), inventoryController.getCategories);

// Get low stock items
router.get('/low-stock', requireRole(['admin', 'manager']), inventoryController.getLowStock);

// Get inventory item by ID
router.get('/:id', requireRole(['admin', 'manager', 'staff']), inventoryController.getInventoryById);

// Stock movements route removed - table not needed

// Create new inventory item
router.post('/', requireRole(['admin', 'manager']), inventoryController.createInventory);

// Update inventory item
router.put('/:id', requireRole(['admin', 'manager']), inventoryController.updateInventory);

// Stock update route removed - using regular update instead

// Delete inventory item (soft delete)
router.delete('/:id', requireRole(['admin']), inventoryController.deleteInventory);

module.exports = router;
