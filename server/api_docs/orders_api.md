# Orders API - Simple Guide

## What is this?
This API helps you create and manage customer orders. When a customer buys a product, the system automatically creates an order and gives them campaign tickets if the product has a prize attached.

---

## Base URL
```
http://localhost:5000/api/orders
```

---

## Authentication - How to Get the Token

All requests need a login token. Here's how to get it:

### Step 1: Customer Signs In (Flutter)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

// After Firebase login
final firebaseToken = await FirebaseAuth.instance.currentUser?.getIdToken();

// Exchange for backend JWT
final response = await http.post(
  Uri.parse('http://localhost:5000/api/firebase/customer/signin'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({'firebase_token': firebaseToken}),
);

final data = json.decode(response.body);
if (data['success']) {
  final token = data['token'];  // ✅ This is your JWT token
  // Save it for future API calls
  await SecureStorage.write('auth_token', token);
}
```

### Step 2: Use Token in API Calls

```dart
final token = await SecureStorage.read('auth_token');

final response = await http.post(
  Uri.parse('http://localhost:5000/api/orders'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',  // ✅ Add token here
  },
  body: json.encode({...}),
);
```

**Important:** 
- Get token from `/api/firebase/customer/signin` endpoint
- Include it in **every** API request
- Token format: `Bearer YOUR_TOKEN_HERE`

---

## API Endpoints

### 1. Create New Order

**What it does:** Creates a new order when a customer buys products.

**URL:** `POST /api/orders`

**Who can use it:** Any logged-in customer

**What to send:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "color": "Red",
      "size": "M"
    },
    {
      "product_id": 2,
      "quantity": 1,
      "color": "Blue",
      "size": "L"
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "city": "New York",
    "postal_code": "10001",
    "country": "USA"
  },
  "payment_status": "paid",
  "payment_method": "stripe",
  "payment_transaction_id": "1234567890",
  "notes": "Any specia instructions",

}
```

**Required fields:**
- `customer_id` - Who is buying
- `items` - Array of items being purchased. Each item must have:
  - `product_id` (required) - The product ID
  - `quantity` (required) - How many
  - `color` (optional) - Selected color variant
  - `size` (optional) - Selected size variant

**Optional fields:**
- `shipping_address` - Where to send the order
- `payment_method` - How they paid (e.g., "stripe", "paypal")
- `payment_transaction_id` - Payment reference number
- `payment_status` - Payment status ("pending", "paid", "failed", "refunded")
- `order_status` - Order status ("pending", "processing", "shipped", "delivered", "cancelled")
- `notes` - Any special instructions

**What you get back:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-1704297600000-123",
    "customer_id": 1,
    "total_amount": 99.98,
    "payment_status": "paid",
    "order_status": "pending",
    "items": [
      {
        "product_id": 1,
        "product_name": "Premium T-Shirt",
        "quantity": 2,
        "price": 49.99,
        "subtotal": 99.98
      }
    ],
    "campaign_entries": [
      {
        "ticket_number": "TKT-5-ABC123",
        "campaign_title": "Win iPhone 15 Pro!"
      }
    ]
  }
}
```

**What happens automatically:**
- ✅ Checks if products are in stock
- ✅ Calculates total price
- ✅ Reduces product stock
- ✅ Creates campaign tickets if product has a prize
- ✅ Generates unique order number

---

### 2. Get Customer's Orders

**What it does:** Shows all orders for one customer.

**URL:** `GET /api/orders/customer/:customerId`

**Who can use it:** The customer or admin

**Example:**
```
GET /api/orders/customer/1
```

**Filters you can add:**
- `?status=pending` - Show only pending orders
- `?page=1&limit=10` - Show 10 orders per page

**What you get back:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-1704297600000-123",
      "total_amount": 99.98,
      "order_status": "pending",
      "items_count": 2,
      "created_at": "2026-01-03T12:00:00.000Z"
    }
  ]
}
```

---

### 3. Get One Order Details

**What it does:** Shows complete details of one order.

**URL:** `GET /api/orders/:orderId`

**Who can use it:** The customer who made it or admin

**Example:**
```
GET /api/orders/1
```

**What you get back:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "ORD-1704297600000-123",
    "total_amount": 99.98,
    "order_status": "delivered",
    "shipping_address": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "New York"
    },
    "items": [
      {
        "product_name": "Premium T-Shirt",
        "quantity": 2,
        "price": 49.99
      }
    ],
    "campaign_entries": [
      {
        "ticket_number": "TKT-5-ABC123",
        "campaign_title": "Win iPhone 15 Pro!",
        "status": "active"
      }
    ]
  }
}
```

---

### 4. Get All Orders (Admin Only)

**What it does:** Shows all orders in the system.

**URL:** `GET /api/orders/admin/all`

**Who can use it:** Admin only

**Filters you can add:**
- `?status=pending` - Show only pending orders
- `?customer_id=1` - Show orders from one customer
- `?page=1&limit=20` - Pagination

**Example:**
```
GET /api/orders/admin/all?status=pending&page=1
```

**What you get back:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-1704297600000-123",
      "customer_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "total_amount": 99.98,
      "order_status": "pending",
      "items_count": 2,
      "created_at": "2026-01-03T12:00:00.000Z"
    }
  ]
}
```

---

### 5. Update Order Status (Admin Only)

**What it does:** Changes the order status (pending → processing → shipped → delivered).

**URL:** `PATCH /api/orders/admin/:orderId/status`

**Who can use it:** Admin only

**What to send:**
```json
{
  "status": "shipped"
}
```

**Valid status values:**
- `pending` - Order received, not started
- `processing` - Preparing the order
- `shipped` - Order sent to customer
- `delivered` - Customer received it
- `cancelled` - Order cancelled

**Example:**
```
PATCH /api/orders/admin/1/status
Body: { "status": "shipped" }
```

**What you get back:**
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

---

### 6. Update Payment Status (Admin Only)

**What it does:** Changes the payment status.

**URL:** `PATCH /api/orders/admin/:orderId/payment`

**Who can use it:** Admin only

**What to send:**
```json
{
  "payment_status": "refunded"
}
```

**Valid payment status values:**
- `pending` - Waiting for payment
- `paid` - Payment received
- `failed` - Payment failed
- `refunded` - Money returned to customer

**What you get back:**
```json
{
  "success": true,
  "message": "Payment status updated successfully"
}
```

---

## Order Status Flow

```
pending → processing → shipped → delivered
   ↓
cancelled (can cancel from any status)
```

## Payment Status Flow

```
pending → paid
   ↓
failed
   ↓
refunded (only from 'paid')
```

---

## Flutter App Example

### Create Order in Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> createOrder() async {
  final token = 'YOUR_TOKEN';
  
  final response = await http.post(
    Uri.parse('http://localhost:5000/api/orders'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: json.encode({
      'customer_id': 1,
      'items': [
        {'product_id': 1, 'quantity': 2}
      ],
      'shipping_address': {
        'name': 'John Doe',
        'phone': '+1234567890',
        'address': '123 Main St',
        'city': 'New York',
        'postal_code': '10001',
        'country': 'USA'
      },
      'payment_status': 'paid'
    }),
  );
  
  if (response.statusCode == 201) {
    final data = json.decode(response.body);
    print('Order created: ${data['order']['order_number']}');
    
    // Show campaign tickets
    for (var entry in data['order']['campaign_entries']) {
      print('You got ticket: ${entry['ticket_number']}');
    }
  }
}
```

### Get Customer Orders in Flutter

```dart
Future<List<dynamic>> getMyOrders(int customerId) async {
  final token = 'YOUR_TOKEN';
  
  final response = await http.get(
    Uri.parse('http://localhost:5000/api/orders/customer/$customerId'),
    headers: {'Authorization': 'Bearer $token'},
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['orders'];
  }
  return [];
}
```

---

## Common Errors

### Product Not Found
```json
{
  "success": false,
  "message": "Product with ID 999 not found"
}
```

### Not Enough Stock
```json
{
  "success": false,
  "message": "Insufficient stock for product: Premium T-Shirt"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Customer ID and items are required"
}
```

### Invalid Status
```json
{
  "success": false,
  "message": "Invalid order status"
}
```

---

## Important Notes

1. **Payment First:** The Flutter app should process payment BEFORE calling the create order API.

2. **Auto Campaign Tickets:** If a product has a campaign attached, tickets are created automatically - one ticket per quantity purchased.

3. **Stock Management:** Stock is reduced automatically when order is created.

4. **Order Numbers:** Each order gets a unique number like `ORD-1704297600000-123`.

5. **Ticket Numbers:** Each campaign ticket gets a unique number like `TKT-5-ABC123`.

---

## Quick Test

Test creating an order in browser console:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customer_id: 1,
    items: [{product_id: 1, quantity: 1}],
    shipping_address: {
      name: 'Test User',
      address: '123 Test St',
      city: 'Test City',
      postal_code: '12345',
      country: 'USA'
    },
    payment_status: 'paid'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

**Last Updated:** January 3, 2026  
**Version:** 1.0.0
