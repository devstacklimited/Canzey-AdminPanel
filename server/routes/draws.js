import express from 'express';
import { getPublicDraws } from '../controllers/drawController.js';

const router = express.Router();

/**
 * GET /api/draws
 * Public endpoint for Flutter app to get all draws
 * Returns: active (live), upcoming (ready to draw), past (completed with winner)
 * No authentication required
 */
router.get('/', getPublicDraws);

export default router;
