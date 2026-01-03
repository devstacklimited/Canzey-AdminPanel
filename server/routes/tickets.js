import express from 'express';
import { getAllTickets } from '../controllers/ticketsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllTickets);

export default router;
