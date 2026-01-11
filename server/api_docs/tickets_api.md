# Tickets API Documentation

Base URL: `/api/tickets`

## Authentication
All ticket endpoints require admin authentication.

**Headers Required:**
```
Authorization: Bearer {admin_token}
```

---

## Endpoints

### 1. Get All Tickets (Admin)

Retrieve all campaign tickets with filtering, search, and pagination options.

**Endpoint:** `GET /api/tickets/admin/all`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of tickets per page (default: 50, max: 100)
- `status` (string, optional): Filter by ticket status (`active`, `used`, `expired`, `cancelled`)
- `campaign_id` (number, optional): Filter by specific campaign
- `customer_id` (number, optional): Filter by specific customer
- `search` (string, optional): Search in ticket number or customer name

**Request:**
```http
GET /api/tickets/admin/all?page=1&limit=20&status=active
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 123,
      "ticket_number": "TKT-1768088466152-268286374",
      "campaign_id": 5,
      "campaign_title": "iPhone 15 Pro Giveaway",
      "customer_id": 42,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "order_id": 78,
      "order_number": "ORD-1768088466152-268286374",
      "status": "active",
      "created_at": "2026-01-10T18:41:06.000Z",
      "expires_at": "2026-02-10T18:41:06.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTickets": 95,
    "limit": 20
  }
}
```

**Response Fields:**

**tickets:** (array)
- `id` (number): Ticket ID
- `ticket_number` (string): Unique ticket identifier
- `campaign_id` (number): Associated campaign ID
- `campaign_title` (string): Name of the campaign
- `customer_id` (number): Customer who owns the ticket
- `customer_name` (string): Customer's full name
- `customer_email` (string): Customer's email
- `order_id` (number): Associated order ID (if purchased)
- `order_number` (string): Order number (if purchased)
- `status` (string): Ticket status (`active`, `used`, `expired`, `cancelled`)
- `created_at` (string): ISO timestamp of ticket creation
- `expires_at` (string): ISO timestamp of ticket expiration

**pagination:**
- `currentPage` (number): Current page number
- `totalPages` (number): Total number of pages
- `totalTickets` (number): Total number of tickets matching filters
- `limit` (number): Number of tickets per page

**Error Responses:**

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**Status Codes:**
- `200 OK`: Tickets retrieved successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database or server error

---

## Usage Examples

### JavaScript/Fetch
```javascript
const token = localStorage.getItem('token');

// Get all active tickets
fetch('http://localhost:5000/api/tickets/admin/all?status=active&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Active Tickets:', data.tickets);
    console.log('Total:', data.pagination.totalTickets);
  });

// Search for specific ticket
fetch('http://localhost:5000/api/tickets/admin/all?search=TKT-123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Search Results:', data.tickets));
```

### cURL
```bash
# Get all tickets
curl -X GET "http://localhost:5000/api/tickets/admin/all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by campaign
curl -X GET "http://localhost:5000/api/tickets/admin/all?campaign_id=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Search tickets
curl -X GET "http://localhost:5000/api/tickets/admin/all?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Ticket Status Values

- `active`: Ticket is valid and can be used
- `used`: Ticket has been used/redeemed
- `expired`: Ticket has passed its expiration date
- `cancelled`: Ticket has been cancelled (e.g., order refunded)

---

## Notes

- Tickets are automatically created when a customer purchases campaign entries
- Each ticket has a unique ticket number for tracking
- Expired tickets are determined by the `expires_at` timestamp
- Search functionality searches across ticket numbers and customer names
- Default sorting is by creation date (newest first)
