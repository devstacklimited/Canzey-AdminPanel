# Dashboard API Documentation

Base URL: `/api/admin/dashboard`

## Authentication
All dashboard endpoints require admin authentication.

**Headers Required:**
```
Authorization: Bearer {admin_token}
```

---

## Endpoints

### 1. Get Dashboard Statistics

Get overview statistics for the admin dashboard including revenue, orders, customers, and recent activity.

**Endpoint:** `GET /api/admin/dashboard/stats`

**Authentication:** Required (Admin only)

**Request:**
```http
GET /api/admin/dashboard/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRevenue": 15420.50,
    "totalOrders": 127,
    "totalCustomers": 89,
    "activeOrders": 12
  },
  "recentOrders": [
    {
      "id": 45,
      "order_number": "ORD-1768088466152-268286374",
      "customer_name": "John Doe",
      "total_amount": 125.00,
      "order_status": "processing",
      "payment_status": "paid",
      "items_count": 3,
      "created_at": "2026-01-10T18:41:06.000Z"
    }
  ]
}
```

**Response Fields:**

**stats:**
- `totalRevenue` (number): Sum of all paid orders
- `totalOrders` (number): Total number of orders in the system
- `totalCustomers` (number): Total number of registered customers
- `activeOrders` (number): Orders with status 'pending' or 'processing'

**recentOrders:** (array of up to 5 most recent orders)
- `id` (number): Order ID
- `order_number` (string): Unique order number
- `customer_name` (string): Full name of the customer
- `total_amount` (number): Order total
- `order_status` (string): Current order status
- `payment_status` (string): Payment status
- `items_count` (number): Number of items in the order
- `created_at` (string): ISO timestamp of order creation

**Error Responses:**

```json
{
  "success": false,
  "message": "Server error"
}
```

**Status Codes:**
- `200 OK`: Statistics retrieved successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database or server error

---

## Usage Examples

### JavaScript/Fetch
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/admin/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Total Revenue:', data.stats.totalRevenue);
    console.log('Recent Orders:', data.recentOrders);
  });
```

### cURL
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Notes

- Statistics are calculated in real-time from the database
- Revenue only includes orders with `payment_status = 'paid'`
- Active orders include both 'pending' and 'processing' statuses
- Recent orders are limited to the 5 most recent entries
- All monetary values are in the system's base currency
