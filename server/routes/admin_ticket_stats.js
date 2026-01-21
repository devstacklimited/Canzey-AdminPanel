import express from 'express';
import { getTicketStats, getCampaignTicketStats } from '../controllers/ticketStatsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/tickets/stats
 * Get comprehensive ticket statistics (admin only)
 */
router.get('/stats', authenticateToken, requireAdmin, getTicketStats);

/**
 * GET /api/admin/tickets/campaign/:id/stats
 * Get ticket statistics for specific campaign (admin only)
 */
router.get('/campaign/:id/stats', authenticateToken, requireAdmin, getCampaignTicketStats);

export default router;
