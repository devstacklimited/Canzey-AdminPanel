import express from 'express';
import { listActiveCampaigns } from '../controllers/campaignController.js';

const router = express.Router();

/**
 * GET /api/campaigns
 * Get active campaigns (public - for Flutter app)
 */
router.get('/', async (req, res) => {
  const result = await listActiveCampaigns();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error,
    });
  }

  res.json({
    success: true,
    campaigns: result.campaigns,
  });
});

export default router;
