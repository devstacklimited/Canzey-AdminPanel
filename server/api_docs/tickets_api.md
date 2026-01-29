# Tickets API Documentation

Base URL: `/api/tickets`

## Authentication

### Admin Endpoints
Require admin authentication:
```
Authorization: Bearer {admin_token}
```

### Customer Endpoints  
Require customer JWT token:
```
Authorization: Bearer {customer_jwt_token}
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
- `customer_id` (number, optional): Filter by specific customer (user ID)
- `search` (string, optional): Search in ticket number or customer name

**Request:**
```http
GET /api/tickets/admin/all?page=1&limit=20&status=active
Authorization: Bearer {admin_token}
```

**Filter by Customer ID:**
```http
GET /api/tickets/admin/all?customer_id=1
Authorization: Bearer {admin_token}
```

**Filter by Customer ID and Status:**
```http
GET /api/tickets/admin/all?customer_id=1&status=active
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
      "is_winner": false,
      "won_at": null
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
- `is_winner` (boolean): Whether this ticket has won a campaign
- `won_at` (string/null): ISO timestamp of when the ticket was marked as winner

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

### 2. Get Customer Tickets (Customer)

Retrieve all tickets for the authenticated customer.

**Endpoint:** `GET /api/firebase/customer/tickets`

**Authentication:** Required (Customer JWT token)

**Request:**
```http
GET /api/firebase/customer/tickets
Authorization: Bearer {customer_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 123,
      "ticket_number": "TKT-1768088466152-268286374",
      "quantity": 2,
      "total_price": 36.00,
      "credits_earned": 100,
      "status": "active",
      "created_at": "2026-01-10T18:41:06.000Z",
      "is_winner": false,
      "won_at": null,
      "campaign_title": "iPhone 15 Pro Giveaway",
      "campaign_image": "/uploads/campaigns/campaign-123.jpg",
      "campaign_description": "Win the latest iPhone 15 Pro with our exclusive giveaway!",
      "campaign_category": "electronics",
      "campaign_ticket_price": 18.00,
      "campaign_credits_per_ticket": 50,
      "prize_id": 45,
      "prize_name": "iPhone 15 Pro Max 256GB",
      "prize_price": 1199.00,
      "prize_image": "/uploads/products/product-456.jpg",
      "prize_sku": "IP15PM-256-BLK",
      "prize_tickets_required": 100,
      "prize_tickets_sold": 67,
      "prize_tickets_remaining": 33
    }
  ]
}
```

**Response Fields:**

**tickets:** (array)
- `id` (number): Ticket ID
- `ticket_number` (string): Unique ticket identifier
- `quantity` (number): Number of tickets
- `total_price` (number): Total price paid
- `credits_earned` (number): Credits earned from this ticket
- `status` (string): Ticket status (`active`, `used`, `expired`)
- `created_at` (string): ISO timestamp of ticket creation
- `is_winner` (boolean): Whether this ticket has won
- `won_at` (string/null): When it won

**Campaign Information:**
- `campaign_title` (string): Name of the campaign
- `campaign_image` (string): Campaign image URL
- `campaign_description` (string): Campaign description
- `campaign_category` (string): Campaign category (`exclusive`, `cash`, `electronics`, `featured`, `new`, `premium`)
- `campaign_ticket_price` (number): Price per ticket for this campaign
- `campaign_credits_per_ticket` (number): Credits earned per ticket

**Prize Information:**
- `prize_id` (number/null): Prize ID if campaign has associated prize
- `prize_name` (string/null): Prize product name
- `prize_price` (number/null): Prize product price
- `prize_image` (string/null): Prize product image URL
- `prize_sku` (string/null): Prize product SKU
- `prize_tickets_required` (number/null): Total tickets required to win this prize
- `prize_tickets_sold` (number/null): Tickets already sold for this prize
- `prize_tickets_remaining` (number/null): Remaining tickets needed to win this prize

**Error Responses:**
```json
{
  "success": false,
  "message": "Server error while fetching tickets"
}
```

**Status Codes:**
- `200 OK`: Tickets retrieved successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Database or server error

---

### 3. Mark Ticket as Winner (Admin)

Mark a specific ticket as a winner or remove its winner status.

**Endpoint:** `POST /api/tickets/admin/mark-winner/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (number): The unique ID of the ticket

**Body Parameters:**
- `is_winner` (boolean): `true` to mark as winner, `false` to remove winner status

**Request:**
```http
POST /api/tickets/admin/mark-winner/123
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "is_winner": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket marked as winner"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

**Status Codes:**
- `200 OK`: Status updated successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Ticket with ID does not exist
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

### Flutter/Dart
```dart
// Get customer tickets
Future<List<Ticket>> getCustomerTickets() async {
  final token = await SecureStorage.read('auth_token');
  
  final response = await http.get(
    Uri.parse('https://admin.canzey.com/api/firebase/customer/tickets'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    if (data['success']) {
      List<Ticket> tickets = (data['tickets'] as List)
          .map((ticket) => Ticket.fromJson(ticket))
          .toList();
      return tickets;
    }
  }
  throw Exception('Failed to load tickets');
}

// Ticket model class
class Ticket {
  final int id;
  final String ticketNumber;
  final int quantity;
  final double totalPrice;
  final int creditsEarned;
  final String status;
  final DateTime createdAt;
  final String campaignTitle;
  final String? campaignImage;
  final String? campaignDescription;
  final String? campaignCategory;
  final double? campaignTicketPrice;
  final int? campaignCreditsPerTicket;
  final PrizeInfo? prize;

  Ticket({
    required this.id,
    required this.ticketNumber,
    required this.quantity,
    required this.totalPrice,
    required this.creditsEarned,
    required this.status,
    required this.createdAt,
    required this.campaignTitle,
    this.campaignImage,
    this.campaignDescription,
    this.campaignCategory,
    this.campaignTicketPrice,
    this.campaignCreditsPerTicket,
    this.prize,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'],
      ticketNumber: json['ticket_number'],
      quantity: json['quantity'],
      totalPrice: double.parse(json['total_price'].toString()),
      creditsEarned: json['credits_earned'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      campaignTitle: json['campaign_title'],
      campaignImage: json['campaign_image'],
      campaignDescription: json['campaign_description'],
      campaignCategory: json['campaign_category'],
      campaignTicketPrice: json['campaign_ticket_price']?.toDouble(),
      campaignCreditsPerTicket: json['campaign_credits_per_ticket'],
      prize: json['prize_id'] != null ? PrizeInfo.fromJson(json) : null,
    );
  }
}

// Prize information model
class PrizeInfo {
  final int id;
  final String name;
  final double price;
  final String image;
  final String sku;
  final int ticketsRequired;
  final int ticketsSold;
  final int ticketsRemaining;

  PrizeInfo({
    required this.id,
    required this.name,
    required this.price,
    required this.image,
    required this.sku,
    required this.ticketsRequired,
    required this.ticketsSold,
    required this.ticketsRemaining,
  });

  factory PrizeInfo.fromJson(Map<String, dynamic> json) {
    return PrizeInfo(
      id: json['prize_id'],
      name: json['prize_name'] ?? 'Unknown Prize',
      price: double.parse(json['prize_price']?.toString() ?? '0'),
      image: json['prize_image'] ?? '',
      sku: json['prize_sku'] ?? '',
      ticketsRequired: json['prize_tickets_required'] ?? 0,
      ticketsSold: json['prize_tickets_sold'] ?? 0,
      ticketsRemaining: json['prize_tickets_remaining'] ?? 0,
    );
  }

  // Calculate progress percentage
  double get progressPercentage {
    if (ticketsRequired == 0) return 0.0;
    return (ticketsSold / ticketsRequired) * 100;
  }

  // Check if prize is close to being won (less than 20% remaining)
  bool get isCloseToWinning {
    return ticketsRemaining <= (ticketsRequired * 0.2);
  }
}

// Ticket Card Widget - Shows all ticket details
class TicketCard extends StatelessWidget {
  final Ticket ticket;

  const TicketCard({required this.ticket, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(8),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with ticket number and status
          Row(
            children: [
              Expanded(
                child: Text(
                  'Ticket: ${ticket.ticketNumber}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
              _buildStatusBadge(ticket.status),
            ],
          ),
          SizedBox(height: 12),
          
          // Campaign image and title
          Row(
            children: [
              if (ticket.campaignImage != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    'https://admin.canzey.com${ticket.campaignImage}',
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(Icons.card_giftcard, color: Colors.grey),
                      );
                    },
                  ),
                ),
                SizedBox(width: 12),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ticket.campaignTitle,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Created: ${_formatDate(ticket.createdAt)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          
          // Ticket details row
          Row(
            children: [
              _buildDetailItem('Quantity', '${ticket.quantity}'),
              Spacer(),
              _buildDetailItem('Price', 'IQD ${ticket.totalPrice.toStringAsFixed(0)}'),
              Spacer(),
              _buildDetailItem('Credits', '${ticket.creditsEarned}'),
            ],
          ),
          
          // Show prize information if available
          if (ticket.prize != null) ...[
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.emoji_events, color: Colors.amber, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Prize Details',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue[800],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      if (ticket.prize!.image.isNotEmpty) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: Image.network(
                            'https://admin.canzey.com${ticket.prize!.image}',
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Icon(Icons.card_giftcard, color: Colors.grey, size: 20),
                              );
                            },
                          ),
                        ),
                        SizedBox(width: 12),
                      ],
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ticket.prize!.name,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 4),
                            Text(
                              'IQD ${ticket.prize!.price.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  // Progress bar
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Progress to Win',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '${ticket.prize!.ticketsSold}/${ticket.prize!.ticketsRequired}',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: ticket.prize!.isCloseToWinning ? Colors.red : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: ticket.prize!.progressPercentage / 100,
                        backgroundColor: Colors.grey[200],
                        valueColor: AlwaysStoppedAnimation<Color>(
                          ticket.prize!.isCloseToWinning ? Colors.red : Colors.blue,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '${ticket.prize!.ticketsRemaining} tickets remaining',
                        style: TextStyle(
                          fontSize: 11,
                          color: ticket.prize!.isCloseToWinning ? Colors.red : Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          
          // Campaign category badge
          if (ticket.campaignCategory != null) ...[
            SizedBox(height: 12),
            _buildCategoryBadge(ticket.campaignCategory!),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'active':
        color = Colors.green;
        break;
      case 'used':
        color = Colors.blue;
        break;
      case 'expired':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryBadge(String category) {
    Color color;
    IconData icon;
    
    switch (category.toLowerCase()) {
      case 'exclusive':
        color = Colors.purple;
        icon = Icons.diamond;
        break;
      case 'cash':
        color = Colors.green;
        icon = Icons.attach_money;
        break;
      case 'electronics':
        color = Colors.blue;
        icon = Icons.devices;
        break;
      case 'featured':
        color = Colors.orange;
        icon = Icons.star;
        break;
      case 'new':
        color = Colors.red;
        icon = Icons.new_releases;
        break;
      case 'premium':
        color = Colors.amber;
        icon = Icons.workspace_premium;
        break;
      default:
        color = Colors.grey;
        icon = Icons.category;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          SizedBox(width: 4),
          Text(
            category.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

// Usage in ListView
ListView.builder(
  itemCount: tickets.length,
  itemBuilder: (context, index) {
    return TicketCard(ticket: tickets[index]);
  },
)
```

### cURL
```bash
# Get all tickets (Admin)
curl -X GET "http://localhost:5000/api/tickets/admin/all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get tickets for specific customer (Admin)
curl -X GET "http://localhost:5000/api/tickets/admin/all?customer_id=1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get active tickets for specific customer (Admin)
curl -X GET "http://localhost:5000/api/tickets/admin/all?customer_id=1&status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get customer tickets (Customer)
curl -X GET "https://admin.canzey.com/api/firebase/customer/tickets" \
  -H "Authorization: Bearer YOUR_CUSTOMER_JWT_TOKEN"

# Filter by campaign (Admin)
curl -X GET "http://localhost:5000/api/tickets/admin/all?campaign_id=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Search tickets (Admin)
curl -X GET "http://localhost:5000/api/tickets/admin/all?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Filtering by Customer/User ID

### Admin API
Admins can filter tickets by any customer ID:

```bash
# Get all tickets for customer with ID 1
GET /api/tickets/admin/all?customer_id=1

# Get active tickets for customer with ID 1
GET /api/tickets/admin/all?customer_id=1&status=active

# Get tickets for customer with ID 1 in specific campaign
GET /api/tickets/admin/all?customer_id=1&campaign_id=5
```

### Customer API
Customers automatically see only their own tickets:

```bash
# Gets tickets for the authenticated customer (no ID needed)
GET /api/firebase/customer/tickets
```

### Use Cases
- **Admin Dashboard**: Show all tickets for a specific customer
- **Customer Support**: View ticket history for a particular user
- **Reporting**: Generate ticket reports per customer
- **Debugging**: Check if a customer has received their tickets

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
