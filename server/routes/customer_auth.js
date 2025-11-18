import express from 'express';
import { customerSignIn, customerSignUp, getCustomerByToken, updateCustomerInfo } from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/customer/signin
 * Sign in customer
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await customerSignIn(email, password);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

/**
 * POST /api/customer/signup
 * Register new customer
 */
router.post('/signup', async (req, res) => {
  const result = await customerSignUp(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.status(201).json(result);
});

/**
 * GET /api/customer/info
 * Get current customer info
 */
router.get('/info', authenticateToken, async (req, res) => {
  const user = await getCustomerByToken(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  res.json({
    success: true,
    user
  });
});

/**
 * PUT /api/customer/edit
 * Update customer info
 */
router.put('/edit', authenticateToken, async (req, res) => {
  const result = await updateCustomerInfo(req.user.userId, req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

/**
 * POST /api/customer/logout
 * Logout customer
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
