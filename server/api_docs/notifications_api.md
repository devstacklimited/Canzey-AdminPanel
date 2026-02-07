# Notifications API - Admin Panel

## Base URL
```
https://admin.canzey.com/api/admin/notifications
```

## Authentication
All endpoints require admin JWT token in Authorization header:
```
Authorization: Bearer <admin-jwt-token>
```

---

## 1. Send Topic Notification

Send notification to all subscribers of a topic (default: `canzey-topic`)

**Endpoint:** `POST /api/admin/notifications/topic`

**Request Body:**
```json
{
  "topic": "canzey-topic",  // Optional, defaults to 'canzey-topic'
  "title": "New Promotion!",
  "body": "Check out our latest offers",
  "data": {                 // Optional custom data
    "type": "promotion",
    "campaign_id": "123"
  },
  "image": "https://example.com/image.jpg"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic notification sent successfully",
  "result": {
    "success": true,
    "messageId": "projects/project-id/messages/123456789",
    "type": "topic",
    "topic": "canzey-topic",
    "recipients": "all_subscribers"
  }
}
```

---

## 2. Send Individual Customer Notification

Send notification to a specific customer by their ID

**Endpoint:** `POST /api/admin/notifications/customer`

**Request Body:**
```json
{
  "customerId": 123,
  "title": "Order Update",
  "body": "Your order has been shipped!",
  "data": {
    "type": "order_update",
    "order_id": "456"
  },
  "image": "https://example.com/tracking.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer notification sent successfully",
  "result": {
    "success": true,
    "messageId": "projects/project-id/messages/123456789",
    "type": "customer",
    "recipients": 1
  }
}
```

---

## 3. Send to All Customers

Send notification to all customers with active FCM tokens

**Endpoint:** `POST /api/admin/notifications/all`

**Request Body:**
```json
{
  "title": "System Maintenance",
  "body": "We'll be performing maintenance tonight at 11 PM",
  "data": {
    "type": "system",
    "maintenance_time": "23:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "All customers notification sent successfully",
  "result": {
    "success": true,
    "type": "bulk",
    "recipients": {
      "total": 150,
      "success": 148,
      "failed": 2
    }
  }
}
```

---

## 4. Get Customers with FCM Tokens

Get list of customers who have FCM tokens for notification sending

**Endpoint:** `GET /api/admin/notifications/customers`

**Response:**
```json
{
  "success": true,
  "customers": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "fcm_token": "fcm_token_here",
      "status": "active"
    }
  ],
  "total": 1
}
```

---

## 5. Test Notification

Send a test notification to verify the system works

**Endpoint:** `POST /api/admin/notifications/test`

**Request Body:**
```json
{
  "type": "topic",           // or "customer"
  "target": "canzey-topic",  // topic name or customer ID
  "title": "Test Notification",
  "body": "This is a test notification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "result": {
    "success": true,
    "messageId": "projects/project-id/messages/123456789"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and body are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to send notification",
  "error": "Firebase error details"
}
```

---

## Usage Examples

### cURL - Topic Notification
```bash
curl -X POST https://admin.canzey.com/api/admin/notifications/topic \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Flash Sale!",
    "body": "50% off on selected items - Today only!",
    "data": {"type": "sale", "discount": "50"}
  }'
```

### cURL - Individual Customer
```bash
curl -X POST https://admin.canzey.com/api/admin/notifications/customer \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 123,
    "title": "Order Delivered",
    "body": "Your package has been delivered successfully!"
  }'
```

### JavaScript/React
```javascript
const sendTopicNotification = async (title, body) => {
  const response = await fetch('/api/admin/notifications/topic', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, body })
  });
  
  const result = await response.json();
  return result;
};
```

---

## Default Topic

The default topic for all app users is: **`canzey-topic`**

- All mobile app users should subscribe to this topic on app startup
- Topic notifications reach all active users regardless of individual FCM tokens
- Use topic notifications for general announcements and promotions

---

## Notification Payload Structure

### Standard Fields
- `title` (required): Notification title
- `body` (required): Notification message
- `image` (optional): Image URL for rich notifications
- `data` (optional): Custom key-value data object

### Data Object (Optional)
```json
{
  "type": "promotion|order_update|system|custom",
  "id": "123",
  "action": "open_screen",
  "screen": "promotion_details"
}
```

### Platform-Specific Features
- **Android**: High priority, default sound, click action
- **iOS**: Default sound, badge increment
- **Web**: Supported if service worker is configured

---

## Rate Limits & Best Practices

1. **Rate Limits**: No hard limits, but be reasonable with bulk sends
2. **Best Practices**:
   - Use topic notifications for general announcements
   - Use individual notifications for personalized updates
   - Include relevant data for deep linking
   - Test notifications before sending to large audiences
3. **Error Handling**: Always check response success and handle failures
4. **Security**: Admin-only endpoints - protect your admin tokens

---

## Troubleshooting

### Common Issues

1. **"Customer not found or no FCM token"**
   - Customer doesn't exist in database
   - Customer hasn't granted notification permissions
   - Customer's FCM token has expired

2. **"Invalid or expired token"**
   - Admin JWT token is invalid or expired
   - Get a new token from admin login

3. **Firebase errors**
   - Check Firebase Admin SDK configuration
   - Verify service account credentials
   - Ensure FCM service is enabled in Firebase project

### Debug Mode
Use the `/test` endpoint to verify your notification setup before sending to real users.
