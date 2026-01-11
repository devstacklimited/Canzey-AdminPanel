import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

export default router;
