import { sendNotification, DEFAULT_TOPIC } from '../services/notificationService.js';
import { listAllCustomers } from './adminController.js';

/**
 * Send notification to topic
 */
export async function sendTopicNotification(req, res) {
  try {
    console.log('📨 [NOTIFICATION API] Topic notification request received');
    
    const { topic, title, body, data, image } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const payload = { title, body, data, image };
    const options = {};
    
    const result = await sendNotification({
      type: 'topic',
      target: topic || DEFAULT_TOPIC,
      payload,
      options
    });

    if (result.success) {
      console.log('✅ [NOTIFICATION API] Topic notification sent successfully');
      res.json({
        success: true,
        message: 'Topic notification sent successfully',
        result
      });
    } else {
      console.log('❌ [NOTIFICATION API] Topic notification failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send topic notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error in topic notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending topic notification',
      error: error.message
    });
  }
}

/**
 * Send notification to multiple customers
 */
export async function sendCustomerNotification(req, res) {
  try {
    console.log('📨 [NOTIFICATION API] Multiple customers notification request received');
    
    const { customerIds, title, body, data, image } = req.body;
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0 || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Customer IDs array, title, and body are required'
      });
    }

    const payload = { title, body, data, image };
    const options = {};
    
    // Get FCM tokens for selected customers
    const connection = await pool.getConnection();
    const [customers] = await connection.execute(
      'SELECT id, fcm_token FROM customers WHERE id IN (?) AND status = ? AND fcm_token IS NOT NULL AND fcm_token != ?',
      [customerIds, 'active', '']
    );
    connection.release();
    
    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customers with FCM tokens found'
      });
    }
    
    const fcmTokens = customers.map(c => c.fcm_token);
    
    const result = await sendNotification({
      type: 'bulk',
      target: fcmTokens,
      payload,
      options
    });

    if (result.success) {
      console.log('✅ [NOTIFICATION API] Multiple customers notification sent successfully');
      res.json({
        success: true,
        message: 'Multiple customers notification sent successfully',
        result: {
          ...result,
          requestedCustomers: customerIds.length,
          customersWithTokens: customers.length,
          customerIds: customers.map(c => c.id)
        }
      });
    } else {
      console.log('❌ [NOTIFICATION API] Multiple customers notification failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send multiple customers notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error in multiple customers notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending multiple customers notification',
      error: error.message
    });
  }
}


/**
 * Get customers list for notification sending
 */
export async function getCustomersForNotifications(req, res) {
  try {
    console.log('📨 [NOTIFICATION API] Get customers for notifications request received');
    
    const result = await listAllCustomers();
    
    if (result.success) {
      // Return ALL customers - frontend will filter by FCM token availability
      const customersWithTokens = result.customers.filter(customer => 
        customer.fcm_token && customer.fcm_token.trim() !== ''
      );
      
      console.log(`✅ [NOTIFICATION API] Found ${result.customers.length} total customers, ${customersWithTokens.length} with FCM tokens`);
      
      res.json({
        success: true,
        customers: result.customers,
        customersWithTokens: customersWithTokens.length,
        total: result.customers.length
      });
    } else {
      console.log('❌ [NOTIFICATION API] Failed to get customers:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customers',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting customers',
      error: error.message
    });
  }
}

/**
 * Test notification endpoint
 */
export async function testNotification(req, res) {
  try {
    console.log('📨 [NOTIFICATION API] Test notification request received');
    
    const { type = 'topic', target = DEFAULT_TOPIC, title = 'Test Notification', body = 'This is a test notification from Canzey Admin' } = req.body;
    
    const payload = { title, body, data: { type: 'test' } };
    
    const result = await sendNotification({
      type,
      target,
      payload
    });

    if (result.success) {
      console.log('✅ [NOTIFICATION API] Test notification sent successfully');
      res.json({
        success: true,
        message: 'Test notification sent successfully',
        result
      });
    } else {
      console.log('❌ [NOTIFICATION API] Test notification failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error in test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending test notification',
      error: error.message
    });
  }
}
