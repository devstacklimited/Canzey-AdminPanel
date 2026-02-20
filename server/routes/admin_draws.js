import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getDraws, getPrizeTicketPool } from '../controllers/drawController.js';

const router = express.Router();

/**
 * GET /api/admin/draws
 * Get list of upcoming and past draws
 */
router.get('/', authenticateToken, requireAdmin, getDraws);

/**
 * GET /api/admin/draws/pool/:productId/:campaignId
 * Get all tickets eligible for a specific prize draw
 */
router.get('/pool/:productId/:campaignId', authenticateToken, requireAdmin, getPrizeTicketPool);

export default router;
