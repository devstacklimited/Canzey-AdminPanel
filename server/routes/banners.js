import express from 'express';
import { getActiveBanners } from '../controllers/bannerController.js';

const router = express.Router();

/**
 * GET /api/v1/public/banners
 * Get all active banners for mobile app
 */
router.get('/', async (req, res) => {
  const result = await getActiveBanners();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error,
    });
  }

  res.json({
    success: true,
    data: result.banners,
  });
});

export default router;
