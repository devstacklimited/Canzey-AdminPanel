import express from 'express';
import { createCampaign, listAllCampaigns, updateCampaign, deleteCampaign } from '../controllers/campaignController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * POST /api/admin/campaigns
 * Create new campaign (admin only)
 */
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // Add image path to request body if file was uploaded
    const campaignData = { ...req.body };
    if (req.file) {
      campaignData.image_url = `/uploads/campaigns/${req.file.filename}`;
    }

    const result = await createCampaign(campaignData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating campaign',
    });
  }
});

/**
 * GET /api/admin/campaigns
 * Get all campaigns (admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const result = await listAllCampaigns();

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

/**
 * PUT /api/admin/campaigns/:id
 * Update campaign (admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    // Add image path to request body if file was uploaded
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_url = `/uploads/campaigns/${req.file.filename}`;
    }

    const result = await updateCampaign(campaignId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating campaign',
    });
  }
});

/**
 * DELETE /api/admin/campaigns/:id
 * Delete campaign (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const campaignId = parseInt(req.params.id);
  const result = await deleteCampaign(campaignId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error,
    });
  }

  res.json(result);
});

export default router;
