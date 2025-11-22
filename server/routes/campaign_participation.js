import express from 'express';
import { participateInCampaign, getCustomerCreditBalance, getCustomerTickets, getCustomerCreditHistory } from '../controllers/ticketController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/campaigns/:id/participate
 * Customer participates in campaign (buys ticket)
 * Requires: Firebase customer JWT token
 */
router.post('/:id/participate', authenticateToken, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const customerId = req.user.userId;
    const { quantity = 1 } = req.body;

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10'
      });
    }

    const result = await participateInCampaign(customerId, campaignId, quantity);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json(result);

  } catch (error) {
    console.error('Campaign participation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during participation'
    });
  }
});

/**
 * GET /api/customer/credits
 * Get customer credit balance
 * Requires: Firebase customer JWT token
 */
router.get('/customer/credits', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.userId;
    const result = await getCustomerCreditBalance(customerId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Get credit balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching balance'
    });
  }
});

/**
 * GET /api/customer/tickets
 * Get customer tickets
 * Requires: Firebase customer JWT token
 */
router.get('/customer/tickets', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.userId;
    const result = await getCustomerTickets(customerId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Get customer tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tickets'
    });
  }
});

/**
 * GET /api/customer/credits/history
 * Get customer credit history
 * Requires: Firebase customer JWT token
 */
router.get('/customer/credits/history', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.userId;
    const result = await getCustomerCreditHistory(customerId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Get credit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching history'
    });
  }
});

export default router;
