import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  listDynamicContent,
  getContentByKey,
  getActiveContentByType,
  getAllActiveContent,
  createDynamicContent,
  updateDynamicContent,
  deleteDynamicContent,
  toggleContentStatus
} from '../controllers/dynamicContentController.js';

const router = express.Router();

/**
 * Admin Routes (Protected)
 */

// Get all content (admin)
router.get('/admin', authenticateToken, requireAdmin, listDynamicContent);

// Create new content
router.post('/admin', authenticateToken, requireAdmin, createDynamicContent);

// Update content
router.put('/admin/:id', authenticateToken, requireAdmin, updateDynamicContent);

// Delete content
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteDynamicContent);

// Toggle status
router.patch('/admin/:id/status', authenticateToken, requireAdmin, toggleContentStatus);

/**
 * Public Routes (For Flutter App)
 */

// Get all active content (grouped by type)
router.get('/active', getAllActiveContent);

// Get active content by type (promo, ad, notification, etc.)
router.get('/type/:type', getActiveContentByType);

// Get content by key
router.get('/key/:key', getContentByKey);

export default router;
