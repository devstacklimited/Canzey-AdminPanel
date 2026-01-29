import express from 'express';
import { getAllTickets, markTicketAsWinner } from '../controllers/ticketsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllTickets);
router.post('/admin/mark-winner/:id', authenticateToken, requireAdmin, markTicketAsWinner);

export default router;
