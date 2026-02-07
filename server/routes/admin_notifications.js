import express from 'express';
import { 
  sendTopicNotification, 
  sendCustomerNotification, 
  getCustomersForNotifications,
  testNotification
} from '../controllers/notificationController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/admin/notifications/topic
 * Send notification to topic
 * Body: { topic?, title, body, data?, image? }
 */
router.post('/topic', authenticateToken, requireAdmin, sendTopicNotification);

/**
 * POST /api/admin/notifications/customer
 * Send notification to multiple customers
 * Body: { customerIds[], title, body, data?, image? }
 */
router.post('/customer', authenticateToken, requireAdmin, sendCustomerNotification);


/**
 * GET /api/admin/notifications/customers
 * Get list of customers with FCM tokens for notification sending
 */
router.get('/customers', authenticateToken, requireAdmin, getCustomersForNotifications);

/**
 * POST /api/admin/notifications/test
 * Test notification endpoint
 * Body: { type?, target?, title?, body? }
 */
router.post('/test', authenticateToken, requireAdmin, testNotification);

export default router;
