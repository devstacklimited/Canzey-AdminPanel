import express from 'express';
import { getProductPrizeInfo, consumeProductTickets } from '../controllers/productPrizeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/v1/public/products/:id/prize
 * Get product prize info for mobile app
 */
router.get('/products/:id/prize', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await getProductPrizeInfo(productId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: result.prize_info
    });
  } catch (error) {
    console.error('Product prize info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prize info',
    });
  }
});

/**
 * POST /api/v1/public/products/:id/consume-tickets
 * Consume tickets when product is ordered (internal use)
 */
router.post('/products/:id/consume-tickets', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { quantity = 1 } = req.body;
    
    const result = await consumeProductTickets(productId, quantity);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Ticket consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while consuming tickets',
    });
  }
});

export default router;
