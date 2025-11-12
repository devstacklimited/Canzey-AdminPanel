const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

// Approve user (admin only)
router.put('/:id/approve', authenticateToken, requireAdmin, userController.approveUser);

// Reject user (admin only)
router.put('/:id/reject', authenticateToken, requireAdmin, userController.rejectUser);

// Deactivate user (admin only)
router.put('/:id/deactivate', authenticateToken, requireAdmin, userController.deactivateUser);

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
