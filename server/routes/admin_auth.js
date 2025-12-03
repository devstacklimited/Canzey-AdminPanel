import express from 'express';
import { 
  adminSignIn, 
  adminSignUp, 
  getAdminByToken, 
  updateAdminInfo, 
  verifyToken, 
  listAllCustomers,
  updateCustomer,
  updateCustomerStatus
} from '../controllers/adminController.js';
import { firebaseCustomerSignUp } from '../controllers/firebaseCustomerController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/admin/signin
 * Sign in admin user
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await adminSignIn(email, password);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

/**
 * POST /api/admin/signup
 * Register new admin user (admin only)
 */
router.post('/signup', authenticateToken, async (req, res) => {
  const result = await adminSignUp(req.body, req.user.role);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.status(201).json(result);
});

/**
 * GET /api/admin/userinfo
 * Get current admin user info
 */
router.get('/userinfo', authenticateToken, async (req, res) => {
  const user = await getAdminByToken(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user
  });
});

/**
 * GET /api/admin/customers
 * Get list of all customers (admin only)
 */
router.get('/customers', authenticateToken, requireAdmin, async (req, res) => {
  const result = await listAllCustomers();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: result.error,
    });
  }

  res.json({
    success: true,
    customers: result.customers,
  });
});

/**
 * POST /api/admin/customers
 * Create new customer (admin only)
 * Creates Firebase user and MySQL record
 */
router.post('/customers', authenticateToken, requireAdmin, async (req, res) => {
  const { email, password, first_name, last_name, phone_number, date_of_birth, gender } = req.body;

  // Basic validation
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, first name, and last name are required'
    });
  }

  const result = await firebaseCustomerSignUp({
    email,
    password,
    first_name,
    last_name,
    phone_number,
    date_of_birth,
    gender
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    customer: result.user
  });
});

/**
 * PUT /api/admin/edit
 * Update admin info
 */
router.put('/edit', authenticateToken, async (req, res) => {
  const result = await updateAdminInfo(req.user.userId, req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

/**
 * POST /api/admin/logout
 * Logout admin user
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * PUT /api/admin/customers/:id
 * Update customer info (admin only)
 */
router.put('/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
  const result = await updateCustomer(req.params.id, req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

/**
 * PATCH /api/admin/customers/:id/status
 * Update customer status (admin only)
 */
router.patch('/customers/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const result = await updateCustomerStatus(req.params.id, status);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error
    });
  }

  res.json(result);
});

export default router;
