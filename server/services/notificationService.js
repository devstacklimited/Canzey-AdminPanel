import admin from '../config/firebase.js';
import pool from '../database/connection.js';

export const DEFAULT_TOPIC = 'canzey-topic';

/**
 * Universal notification sender service
 * Supports:
 * - Topic broadcast to all subscribers
 * - Direct notification to a single customer by fcm_token
 * - Bulk notification to multiple customers
 */

/**
 * Send notification to a topic
 * @param {string} topic - Topic name (defaults to 'canzey-topic')
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Optional custom data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result with success status
 */
export async function sendToTopic(topic = DEFAULT_TOPIC, payload, options = {}) {
  try {
    console.log(`📱 [NOTIFICATION] Sending to topic: ${topic}`);
    
    const message = {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image && { imageUrl: payload.image })
      },
      data: {
        type: 'broadcast',
        timestamp: new Date().toISOString(),
        ...payload.data
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      ...options
    };

    const response = await admin.messaging().send(message);
    console.log('✅ [NOTIFICATION] Topic message sent successfully:', response);
    
    return {
      success: true,
      messageId: response,
      type: 'topic',
      topic,
      recipients: 'all_subscribers'
    };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending to topic:', error);
    return {
      success: false,
      error: error.message,
      type: 'topic',
      topic
    };
  }
}

/**
 * Send notification to a single customer by FCM token
 * @param {string} fcmToken - Customer's FCM token
 * @param {Object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {Object} payload.data - Optional custom data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result with success status
 */
export async function sendToCustomer(fcmToken, payload, options = {}) {
  try {
    console.log(`📱 [NOTIFICATION] Sending to customer token: ${fcmToken.substring(0, 20)}...`);
    
    if (!fcmToken) {
      return {
        success: false,
        error: 'FCM token is required',
        type: 'customer'
      };
    }

    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image && { imageUrl: payload.image })
      },
      data: {
        type: 'direct',
        timestamp: new Date().toISOString(),
        ...payload.data
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      ...options
    };

    const response = await admin.messaging().send(message);
    console.log('✅ [NOTIFICATION] Customer message sent successfully:', response);
    
    return {
      success: true,
      messageId: response,
      type: 'customer',
      recipients: 1
    };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending to customer:', error);
    return {
      success: false,
      error: error.message,
      type: 'customer'
    };
  }
}

/**
 * Send notification to multiple customers (bulk)
 * @param {Array<string>} fcmTokens - Array of FCM tokens
 * @param {Object} payload - Notification payload
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result with success status and details
 */
export async function sendToMultipleCustomers(fcmTokens, payload, options = {}) {
  try {
    console.log(`📱 [NOTIFICATION] Sending to ${fcmTokens.length} customers`);
    
    if (!fcmTokens || fcmTokens.length === 0) {
      return {
        success: false,
        error: 'FCM tokens array is required',
        type: 'bulk'
      };
    }

    // Filter out null/undefined tokens
    const validTokens = fcmTokens.filter(token => token && token.trim() !== '');
    
    if (validTokens.length === 0) {
      return {
        success: false,
        error: 'No valid FCM tokens provided',
        type: 'bulk'
      };
    }

    const message = {
      tokens: validTokens,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image && { imageUrl: payload.image })
      },
      data: {
        type: 'bulk',
        timestamp: new Date().toISOString(),
        ...payload.data
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      ...options
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('✅ [NOTIFICATION] Bulk message sent:', response);
    
    return {
      success: true,
      messageId: response,
      type: 'bulk',
      recipients: {
        total: validTokens.length,
        success: response.successCount,
        failed: response.failureCount
      },
      details: response
    };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending bulk message:', error);
    return {
      success: false,
      error: error.message,
      type: 'bulk'
    };
  }
}

/**
 * Get customer's FCM token by customer ID
 * @param {number} customerId - Customer ID
 * @returns {Promise<string|null>} FCM token or null
 */
export async function getCustomerFcmToken(customerId) {
  try {
    const connection = await pool.getConnection();
    const [customers] = await connection.execute(
      'SELECT fcm_token FROM customers WHERE id = ? AND status = ?',
      [customerId, 'active']
    );
    connection.release();
    
    if (customers.length === 0) {
      return null;
    }
    
    return customers[0].fcm_token;
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error fetching customer FCM token:', error);
    return null;
  }
}

/**
 * Get all active customers' FCM tokens
 * @returns {Promise<Array<string>>} Array of FCM tokens
 */
export async function getAllCustomerFcmTokens() {
  try {
    const connection = await pool.getConnection();
    const [customers] = await connection.execute(
      'SELECT fcm_token FROM customers WHERE status = ? AND fcm_token IS NOT NULL AND fcm_token != ?',
      ['active', '']
    );
    connection.release();
    
    return customers.map(c => c.fcm_token).filter(token => token && token.trim() !== '');
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error fetching all FCM tokens:', error);
    return [];
  }
}

/**
 * Send notification to customer by ID (convenience function)
 * @param {number} customerId - Customer ID
 * @param {Object} payload - Notification payload
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result with success status
 */
export async function sendToCustomerById(customerId, payload, options = {}) {
  try {
    const fcmToken = await getCustomerFcmToken(customerId);
    
    if (!fcmToken) {
      return {
        success: false,
        error: 'Customer not found or no FCM token available',
        type: 'customer',
        customerId
      };
    }
    
    return await sendToCustomer(fcmToken, payload, options);
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending to customer by ID:', error);
    return {
      success: false,
      error: error.message,
      type: 'customer',
      customerId
    };
  }
}

/**
 * Universal notification sender - routes to appropriate method
 * @param {Object} params - Parameters
 * @param {string} params.type - 'topic', 'customer', 'customer_id', 'bulk', or 'all'
 * @param {string|number|Array} params.target - Topic name, customer ID, or array of tokens
 * @param {Object} params.payload - Notification payload
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Result with success status
 */
export async function sendNotification({ type, target, payload, options = {} }) {
  switch (type) {
    case 'topic':
      return await sendToTopic(target || DEFAULT_TOPIC, payload, options);
    
    case 'customer':
      return await sendToCustomer(target, payload, options);
    
    case 'customer_id':
      return await sendToCustomerById(target, payload, options);
    
    case 'bulk':
      return await sendToMultipleCustomers(target, payload, options);
    
    case 'all':
      const allTokens = await getAllCustomerFcmTokens();
      if (allTokens.length === 0) {
        return {
          success: false,
          error: 'No customers with FCM tokens found',
          type: 'all'
        };
      }
      return await sendToMultipleCustomers(allTokens, payload, options);
    
    default:
      return {
        success: false,
        error: `Invalid notification type: ${type}`,
        type
      };
  }
}

export default {
  sendToTopic,
  sendToCustomer,
  sendToMultipleCustomers,
  sendToCustomerById,
  getCustomerFcmToken,
  getAllCustomerFcmTokens,
  sendNotification,
  DEFAULT_TOPIC
};
