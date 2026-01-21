# Ticket Statistics API Documentation

## Overview
The Ticket Statistics API provides comprehensive analytics for ticket sales, revenue, and participation across campaigns. Admins can view overall statistics, campaign-specific data, and customer insights.

## Base URL
```
https://your-domain.com/api
```

## Authentication
All endpoints require JWT authentication with admin privileges.

---

## Endpoints

### 1. Get Comprehensive Ticket Statistics
**GET** `/api/admin/tickets/stats`

Get complete ticket statistics including overview, campaign breakdowns, recent sales, and customer analytics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "overview": {
      "total_tickets": 150,
      "total_quantity": 1250,
      "total_revenue": 12500.00
    },
    "by_campaign": [
      {
        "id": 1,
        "title": "Big Sale Campaign",
        "unique_tickets": 75,
        "total_quantity": 600,
        "total_revenue": 6000.00,
        "avg_ticket_value": 10.00
      },
      {
        "id": 2,
        "title": "New Arrivals",
        "unique_tickets": 50,
        "total_quantity": 400,
        "total_revenue": 4000.00,
        "avg_ticket_value": 10.00
      }
    ],
    "recent_sales": [
      {
        "ticket_number": "TKT-1A2B3C-XYZ45",
        "quantity": 5,
        "total_price": 50.00,
        "credits_earned": 100,
        "created_at": "2024-01-20T10:30:00.000Z",
        "campaign_title": "Big Sale Campaign",
        "customer_name": "John Doe"
      }
    ],
    "top_customers": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "email": "john@example.com",
        "unique_tickets": 10,
        "total_quantity": 50,
        "total_spent": 500.00
      }
    ],
    "daily_sales": [
      {
        "date": "2024-01-20",
        "tickets_sold": 25,
        "total_quantity": 100,
        "daily_revenue": 1000.00
      }
    ],
    "active_campaigns": [
      {
        "id": 1,
        "title": "Big Sale Campaign",
        "ticket_price": 10.00,
        "credits_per_ticket": 20,
        "max_tickets_per_user": 10,
        "participants": 75,
        "total_tickets_sold": 600,
        "campaign_revenue": 6000.00
      }
    ]
  }
}
```

---

### 2. Get Campaign-Specific Ticket Statistics
**GET** `/api/admin/tickets/campaign/:id/stats`

Get detailed ticket statistics for a specific campaign, including customer breakdown.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Campaign ID |

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "campaign": {
      "id": 1,
      "title": "Big Sale Campaign",
      "ticket_price": 10.00,
      "credits_per_ticket": 20,
      "max_tickets_per_user": 10,
      "participants": 75,
      "total_tickets_sold": 600,
      "total_revenue": 6000.00,
      "avg_ticket_value": 10.00
    },
    "customer_breakdown": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "email": "john@example.com",
        "ticket_number": "TKT-1A2B3C-XYZ45",
        "quantity": 5,
        "total_price": 50.00,
        "credits_earned": 100,
        "created_at": "2024-01-20T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Data Fields Explained

### Overview Statistics
| Field | Type | Description |
|-------|------|-------------|
| total_tickets | number | Total unique ticket purchases |
| total_quantity | number | Total number of tickets sold (including quantities) |
| total_revenue | number | Total revenue from all ticket sales |

### Campaign Breakdown
| Field | Type | Description |
|-------|------|-------------|
| id | number | Campaign ID |
| title | string | Campaign title |
| unique_tickets | number | Number of unique ticket purchases |
| total_quantity | number | Total tickets sold for this campaign |
| total_revenue | number | Total revenue from this campaign |
| avg_ticket_value | number | Average ticket value for this campaign |

### Recent Sales
| Field | Type | Description |
|-------|------|-------------|
| ticket_number | string | Unique ticket identifier |
| quantity | number | Number of tickets in this purchase |
| total_price | number | Total price for this purchase |
| credits_earned | number | Credits earned from this purchase |
| created_at | string | Purchase timestamp |
| campaign_title | string | Campaign name |
| customer_name | string | Customer full name |

### Top Customers
| Field | Type | Description |
|-------|------|-------------|
| id | number | Customer ID |
| customer_name | string | Customer full name |
| email | string | Customer email |
| unique_tickets | number | Number of unique purchases |
| total_quantity | number | Total tickets purchased |
| total_spent | number | Total amount spent |

### Daily Sales
| Field | Type | Description |
|-------|------|-------------|
| date | string | Date (YYYY-MM-DD) |
| tickets_sold | number | Number of ticket purchases |
| total_quantity | number | Total tickets sold that day |
| daily_revenue | number | Revenue generated that day |

---

## Ticket Generation Process

### How Tickets Are Generated

1. **Customer Participation**: Customer calls `POST /api/campaigns/:id/participate`
2. **Validation**: System checks campaign status, date range, and user limits
3. **Ticket Number Generation**: 
   ```javascript
   function generateTicketNumber() {
     const timestamp = Date.now().toString(36);
     const random = Math.random().toString(36).substr(2, 5);
     return `TKT-${timestamp}-${random}`.toUpperCase();
   }
   ```
4. **Database Insert**: Creates record in `campaign_tickets` table
5. **Credit Award**: Adds credits to customer account (expires in 6 months)

### Ticket Number Format
- **Format**: `TKT-{timestamp}-{random}`
- **Example**: `TKT-1A2B3C-XYZ45`
- **Uniqueness**: Guaranteed unique across all tickets

### Credit System
- **Credits Earned**: `credits_per_ticket × quantity`
- **Credit Expiry**: 6 months from purchase date
- **Credit Type**: 'earned' (can be spent later)

---

## Database Schema

### campaign_tickets Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| campaign_id | INT | Foreign key to campaigns |
| customer_id | INT | Foreign key to customers |
| ticket_number | VARCHAR | Unique ticket identifier |
| quantity | INT | Number of tickets in purchase |
| total_price | DECIMAL | Total price paid |
| credits_earned | INT | Credits awarded |
| status | ENUM | Ticket status |
| created_at | TIMESTAMP | Purchase time |

### customer_credits Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| customer_id | INT | Foreign key to customers |
| ticket_id | INT | Foreign key to campaign_tickets |
| credits | INT | Credit amount |
| type | ENUM | 'earned' or 'spent' |
| description | TEXT | Credit description |
| expires_at | TIMESTAMP | Credit expiry date |

---

## Use Cases

### Dashboard Analytics
- Display total revenue and ticket sales
- Show top-performing campaigns
- Highlight recent customer activity

### Campaign Performance
- Track individual campaign success
- Monitor participant engagement
- Analyze revenue per campaign

### Customer Insights
- Identify most valuable customers
- Track customer participation patterns
- Monitor credit usage

### Financial Reporting
- Daily/weekly/monthly revenue tracking
- Campaign profitability analysis
- Customer lifetime value calculation

---

## Rate Limiting
- **Admin endpoints**: 100 requests per minute per admin
- **Data refresh**: Real-time (no caching)

---

## Error Responses

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

### 404 Not Found
```json
{
  "success": false,
  "message": "Campaign not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error while fetching ticket stats"
}
```
