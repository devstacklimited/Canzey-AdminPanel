import express from 'express';
import { 
  attachPrizeToProduct, 
  getAllProductPrizes, 
  updateProductPrize, 
  deleteProductPrize 
} from '../controllers/productPrizeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/admin/product-prizes
 * Attach prize to product (admin only)
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await attachPrizeToProduct(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Product prize attachment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error attaching prize to product',
    });
  }
});

/**
 * GET /api/admin/product-prizes
 * Get all product-prize mappings (admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const result = await getAllProductPrizes();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error,
    });
  }

  res.json({
    success: true,
    product_prizes: result.product_prizes,
  });
});

/**
 * PUT /api/admin/product-prizes/:id
 * Update product prize (admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const prizeId = parseInt(req.params.id);
    const result = await updateProductPrize(prizeId, req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Product prize update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product prize',
    });
  }
});

/**
 * DELETE /api/admin/product-prizes/:id
 * Delete product prize mapping (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const prizeId = parseInt(req.params.id);
  const result = await deleteProductPrize(prizeId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error,
    });
  }

  res.json(result);
});

export default router;
