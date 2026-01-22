import express from 'express';
import { createBanner, listAllBanners, updateBanner, deleteBanner, toggleBannerStatus } from '../controllers/bannerController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/bannerUpload.js';

const router = express.Router();

/**
 * POST /api/admin/banners
 * Create new banner (admin only)
 */
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // Add image path to request body if file was uploaded
    const bannerData = { ...req.body };
    if (req.file) {
      // Use full path including subfolder for the database
      bannerData.image_url = `/uploads/banners/${req.file.filename}`;
    }

    // Convert string values to appropriate types
    bannerData.width = parseInt(bannerData.width) || 1080;
    bannerData.height = parseInt(bannerData.height) || 400;
    bannerData.priority = parseInt(bannerData.priority) || 0;
    bannerData.is_active = bannerData.is_active === 'true';

    const result = await createBanner(bannerData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Banner creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating banner',
    });
  }
});

/**
 * GET /api/admin/banners
 * Get all banners (admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const result = await listAllBanners();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error,
    });
  }

  res.json({
    success: true,
    banners: result.banners,
  });
});

/**
 * PUT /api/admin/banners/:id
 * Update banner (admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);
    
    // Add image path to request body if file was uploaded
    const updateData = { ...req.body };
    if (req.file) {
      // Use full path including subfolder for the database
      updateData.image_url = `/uploads/banners/${req.file.filename}`;
    }

    // Convert string values to appropriate types
    updateData.width = parseInt(updateData.width) || 1080;
    updateData.height = parseInt(updateData.height) || 400;
    updateData.priority = parseInt(updateData.priority) || 0;
    updateData.is_active = updateData.is_active === 'true';

    const result = await updateBanner(bannerId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Banner update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating banner',
    });
  }
});

/**
 * DELETE /api/admin/banners/:id
 * Delete banner (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const bannerId = parseInt(req.params.id);
  const result = await deleteBanner(bannerId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error,
    });
  }

  res.json(result);
});

/**
 * PATCH /api/admin/banners/:id/toggle
 * Toggle banner active status (admin only)
 */
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);
    const { is_active } = req.body;
    
    const result = await toggleBannerStatus(bannerId, is_active);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Banner toggle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling banner status',
    });
  }
});

export default router;
