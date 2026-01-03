import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus
} from '../controllers/orderController.js';

const router = express.Router();

/**
 * Admin Routes (Must come BEFORE dynamic routes)
 */

// Get all orders (admin)
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrders);

// Update order status (admin)
router.patch('/admin/:orderId/status', authenticateToken, requireAdmin, updateOrderStatus);

// Update payment status (admin)
router.patch('/admin/:orderId/payment', authenticateToken, requireAdmin, updatePaymentStatus);

/**
 * Public/Customer Routes
 */

// Create new order (requires authentication)
router.post('/', authenticateToken, createOrder);

// Get customer's orders
router.get('/customer/:customerId', authenticateToken, getCustomerOrders);

// Get specific order details (MUST come after /admin/all)
router.get('/:orderId', authenticateToken, getOrderById);

export default router;
