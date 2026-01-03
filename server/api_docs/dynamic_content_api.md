# Dynamic Content API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Data Models](#data-models)
- [Flutter Integration](#flutter-integration)
- [Error Handling](#error-handling)

---

## Overview

The Dynamic Content API allows you to manage promotional texts, ads, notifications, and other dynamic content that can be displayed in your Flutter mobile app without requiring app updates.

**Key Features:**
- ✅ Real-time content updates
- ✅ Type-based categorization (promo, ad, notification, banner, popup)
- ✅ Key-based content retrieval
- ✅ Priority-based ordering
- ✅ Date-based scheduling
- ✅ Active/Inactive status control

---

## Base URL

```
Production: https://your-domain.com/api/content
Development: http://localhost:5000/api/content
```

---

## Authentication

### Public Endpoints
No authentication required. These endpoints are designed for your Flutter app to fetch active content.

### Admin Endpoints
Require JWT authentication token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints

### 1. Get All Active Content

Fetch all active content grouped by type.

**Endpoint:**
```http
GET /active
```

**Response:**
```json
{
  "success": true,
  "content": {
    "promo": [
      {
        "id": 1,
        "key_name": "home_welcome_banner",
        "title": "Welcome to Canzey!",
        "description": "Get 20% off on your first order. Use code: WELCOME20",
        "content_type": "promo",
        "status": "active",
        "priority": 1,
        "start_date": null,
        "end_date": null,
        "metadata": null,
        "created_at": "2026-01-03T10:00:00.000Z",
        "updated_at": "2026-01-03T10:00:00.000Z"
      }
    ],
    "banner": [...],
    "notification": [...],
    "ad": [...],
    "popup": [...]
  }
}
```

**Notes:**
- Only returns content where `status = 'active'`
- Automatically filters by date range (if set)
- Content is grouped by `content_type`
- Ordered by `priority` (descending)

---

### 2. Get Content by Type

Fetch all active content of a specific type.

**Endpoint:**
```http
GET /type/:type
```

**Parameters:**
| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| type      | string | Yes      | Content type: promo, ad, notification, banner, popup, other |

**Example Request:**
```http
GET /type/promo
```

**Response:**
```json
{
  "success": true,
  "content": [
    {
      "id": 1,
      "key_name": "home_welcome_banner",
      "title": "Welcome to Canzey!",
      "description": "Get 20% off on your first order. Use code: WELCOME20",
      "content_type": "promo",
      "status": "active",
      "priority": 1,
      "start_date": null,
      "end_date": null,
      "metadata": null,
      "created_at": "2026-01-03T10:00:00.000Z",
      "updated_at": "2026-01-03T10:00:00.000Z"
    },
    {
      "id": 2,
      "key_name": "checkout_promo_text",
      "title": "Limited Time Offer",
      "description": "Free shipping on orders above $50!",
      "content_type": "promo",
      "status": "active",
      "priority": 2,
      "start_date": null,
      "end_date": null,
      "metadata": null,
      "created_at": "2026-01-03T10:00:00.000Z",
      "updated_at": "2026-01-03T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Content by Key

Fetch a specific content item by its unique key.

**Endpoint:**
```http
GET /key/:key
```

**Parameters:**
| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| key       | string | Yes      | Unique key name (e.g., home_welcome_banner) |

**Example Request:**
```http
GET /key/home_welcome_banner
```

**Response (Success):**
```json
{
  "success": true,
  "content": {
    "id": 1,
    "key_name": "home_welcome_banner",
    "title": "Welcome to Canzey!",
    "description": "Get 20% off on your first order. Use code: WELCOME20",
    "content_type": "promo",
    "status": "active",
    "priority": 1,
    "start_date": null,
    "end_date": null,
    "metadata": null,
    "created_at": "2026-01-03T10:00:00.000Z",
    "updated_at": "2026-01-03T10:00:00.000Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Content not found"
}
```

**HTTP Status Codes:**
- `200 OK` - Content found
- `404 Not Found` - Content not found or inactive

---

## Admin Endpoints

All admin endpoints require authentication.

### 4. List All Content (Admin)

Get all content items (including inactive).

**Endpoint:**
```http
GET /admin
```

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "content": [
    {
      "id": 1,
      "key_name": "home_welcome_banner",
      "title": "Welcome to Canzey!",
      "description": "Get 20% off on your first order. Use code: WELCOME20",
      "content_type": "promo",
      "status": "active",
      "priority": 1,
      "start_date": null,
      "end_date": null,
      "metadata": null,
      "created_at": "2026-01-03T10:00:00.000Z",
      "updated_at": "2026-01-03T10:00:00.000Z"
    },
    ...
  ]
}
```

---

### 5. Create Content (Admin)

Create a new content item.

**Endpoint:**
```http
POST /admin
```

**Headers:**
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "key_name": "summer_sale_2026",
  "title": "Summer Sale!",
  "description": "Get up to 50% off on selected items. Limited time only!",
  "content_type": "promo",
  "status": "active",
  "priority": 5,
  "start_date": "2026-06-01T00:00:00",
  "end_date": "2026-08-31T23:59:59",
  "metadata": {
    "discount_code": "SUMMER50",
    "min_purchase": 100
  }
}
```

**Required Fields:**
- `key_name` (string, unique)
- `title` (string)

**Optional Fields:**
- `description` (text)
- `content_type` (enum: promo, ad, notification, banner, popup, other) - default: 'promo'
- `status` (enum: active, inactive) - default: 'active'
- `priority` (integer) - default: 0
- `start_date` (datetime)
- `end_date` (datetime)
- `metadata` (JSON object)

**Response (Success):**
```json
{
  "success": true,
  "message": "Content created successfully",
  "id": 4
}
```

**Response (Error - Duplicate Key):**
```json
{
  "success": false,
  "message": "A content with this key already exists"
}
```

**HTTP Status Codes:**
- `201 Created` - Content created successfully
- `400 Bad Request` - Validation error or duplicate key
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

### 6. Update Content (Admin)

Update an existing content item.

**Endpoint:**
```http
PUT /admin/:id
```

**Headers:**
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Parameters:**
| Parameter | Type    | Required | Description        |
|-----------|---------|----------|--------------------|
| id        | integer | Yes      | Content ID to update |

**Request Body:**
```json
{
  "key_name": "summer_sale_2026",
  "title": "Summer Mega Sale!",
  "description": "Get up to 70% off on selected items!",
  "content_type": "promo",
  "status": "active",
  "priority": 10,
  "start_date": "2026-06-01T00:00:00",
  "end_date": "2026-08-31T23:59:59",
  "metadata": {
    "discount_code": "SUMMER70",
    "min_purchase": 50
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Content updated successfully"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Content not found"
}
```

**HTTP Status Codes:**
- `200 OK` - Content updated successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Content not found
- `500 Internal Server Error` - Server error

---

### 7. Delete Content (Admin)

Permanently delete a content item.

**Endpoint:**
```http
DELETE /admin/:id
```

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Parameters:**
| Parameter | Type    | Required | Description        |
|-----------|---------|----------|--------------------|
| id        | integer | Yes      | Content ID to delete |

**Response (Success):**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Content not found"
}
```

**HTTP Status Codes:**
- `200 OK` - Content deleted successfully
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Content not found
- `500 Internal Server Error` - Server error

---

### 8. Toggle Content Status (Admin)

Quickly toggle content between active and inactive.

**Endpoint:**
```http
PATCH /admin/:id/status
```

**Headers:**
```http
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Parameters:**
| Parameter | Type    | Required | Description        |
|-----------|---------|----------|--------------------|
| id        | integer | Yes      | Content ID to update |

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Valid Status Values:**
- `active`
- `inactive`

**Response (Success):**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

**Response (Invalid Status):**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**HTTP Status Codes:**
- `200 OK` - Status updated successfully
- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Content not found
- `500 Internal Server Error` - Server error

---

## Data Models

### Content Object

```typescript
{
  id: number;                    // Auto-generated
  key_name: string;              // Unique identifier (e.g., "home_welcome_banner")
  title: string;                 // Display title
  description: string | null;    // Content text/description
  content_type: 'promo' | 'ad' | 'notification' | 'banner' | 'popup' | 'other';
  status: 'active' | 'inactive'; // Visibility status
  priority: number;              // Display order (higher = first)
  start_date: string | null;     // ISO 8601 datetime (optional)
  end_date: string | null;       // ISO 8601 datetime (optional)
  metadata: object | null;       // Additional JSON data
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}
```

### Content Types

| Type         | Description                          | Use Case                           |
|--------------|--------------------------------------|------------------------------------|
| promo        | Promotional offers and discounts     | Sales, special offers              |
| ad           | Advertisements                       | Product ads, sponsored content     |
| notification | System notifications                 | Updates, announcements             |
| banner       | Banner images/text                   | Hero banners, top banners          |
| popup        | Popup messages                       | Important alerts, modals           |
| other        | Custom content                       | Any other use case                 |

---

## Flutter Integration

### Complete Service Class

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ContentService {
  static const String baseUrl = 'https://your-domain.com/api/content';

  /// Fetch all active content grouped by type
  Future<Map<String, List<dynamic>>> fetchAllContent() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/active'));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return Map<String, List<dynamic>>.from(data['content']);
        }
      }
      throw Exception('Failed to load content');
    } catch (e) {
      print('Error fetching content: $e');
      rethrow;
    }
  }

  /// Fetch content by type
  Future<List<dynamic>> fetchByType(String type) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/type/$type'));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return List<dynamic>.from(data['content']);
        }
      }
      throw Exception('Failed to load content');
    } catch (e) {
      print('Error fetching content by type: $e');
      rethrow;
    }
  }

  /// Fetch content by key
  Future<Map<String, dynamic>?> fetchByKey(String key) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/key/$key'));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          return data['content'];
        }
      }
      return null;
    } catch (e) {
      print('Content not found: $key');
      return null;
    }
  }
}
```

### Usage Examples

#### Example 1: Display Welcome Banner

```dart
class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ContentService _contentService = ContentService();
  Map<String, dynamic>? welcomeBanner;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadWelcomeBanner();
  }

  Future<void> loadWelcomeBanner() async {
    final banner = await _contentService.fetchByKey('home_welcome_banner');
    setState(() {
      welcomeBanner = banner;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Column(
        children: [
          // Display welcome banner if available
          if (welcomeBanner != null)
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.purple, Colors.blue],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    welcomeBanner!['title'],
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    welcomeBanner!['description'] ?? '',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          // Rest of your content
        ],
      ),
    );
  }
}
```

#### Example 2: Display All Promos

```dart
class PromosScreen extends StatefulWidget {
  @override
  _PromosScreenState createState() => _PromosScreenState();
}

class _PromosScreenState extends State<PromosScreen> {
  final ContentService _contentService = ContentService();
  List<dynamic> promos = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadPromos();
  }

  Future<void> loadPromos() async {
    final promoList = await _contentService.fetchByType('promo');
    setState(() {
      promos = promoList;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(title: Text('Promotions')),
      body: ListView.builder(
        itemCount: promos.length,
        itemBuilder: (context, index) {
          final promo = promos[index];
          return Card(
            margin: EdgeInsets.all(8),
            child: ListTile(
              leading: Icon(Icons.local_offer, color: Colors.purple),
              title: Text(
                promo['title'],
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(promo['description'] ?? ''),
              trailing: Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {
                // Handle promo tap
              },
            ),
          );
        },
      ),
    );
  }
}
```

#### Example 3: Cached Content with Provider

```dart
import 'package:flutter/material.dart';

class ContentProvider extends ChangeNotifier {
  final ContentService _contentService = ContentService();
  Map<String, List<dynamic>> _allContent = {};
  bool _isLoading = false;
  DateTime? _lastFetch;

  Map<String, List<dynamic>> get allContent => _allContent;
  bool get isLoading => _isLoading;

  /// Fetch content with caching (refresh every 5 minutes)
  Future<void> fetchContent({bool forceRefresh = false}) async {
    // Check if we need to refresh
    if (!forceRefresh && _lastFetch != null) {
      final difference = DateTime.now().difference(_lastFetch!);
      if (difference.inMinutes < 5) {
        return; // Use cached data
      }
    }

    _isLoading = true;
    notifyListeners();

    try {
      _allContent = await _contentService.fetchAllContent();
      _lastFetch = DateTime.now();
    } catch (e) {
      print('Error fetching content: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get content by type from cache
  List<dynamic> getByType(String type) {
    return _allContent[type] ?? [];
  }

  /// Get content by key from cache
  Map<String, dynamic>? getByKey(String key) {
    for (var contentList in _allContent.values) {
      for (var content in contentList) {
        if (content['key_name'] == key) {
          return content;
        }
      }
    }
    return null;
  }
}
```

---

## Error Handling

### Standard Error Response

All endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning              | Description                          |
|------|----------------------|--------------------------------------|
| 200  | OK                   | Request successful                   |
| 201  | Created              | Resource created successfully        |
| 400  | Bad Request          | Invalid request data                 |
| 401  | Unauthorized         | Missing or invalid authentication    |
| 404  | Not Found            | Resource not found                   |
| 500  | Internal Server Error| Server error                         |

### Common Error Scenarios

#### 1. Content Not Found
```json
{
  "success": false,
  "message": "Content not found"
}
```

#### 2. Duplicate Key
```json
{
  "success": false,
  "message": "A content with this key already exists"
}
```

#### 3. Invalid Status
```json
{
  "success": false,
  "message": "Invalid status"
}
```

#### 4. Missing Required Fields
```json
{
  "success": false,
  "message": "Key name and title are required"
}
```

---

## Best Practices

### 1. Content Keys Naming Convention
Use lowercase with underscores:
- ✅ `home_welcome_banner`
- ✅ `checkout_promo_text`
- ✅ `app_maintenance_notice`
- ❌ `homeWelcomeBanner`
- ❌ `Home Welcome Banner`

### 2. Caching Strategy
- Cache content locally in your Flutter app
- Refresh on app launch
- Implement periodic refresh (e.g., every 5 minutes)
- Use fallback content if API fails

### 3. Priority Management
- Use priority to control display order
- Higher priority = displayed first
- Example: Critical notifications = 100, Regular promos = 10

### 4. Date Scheduling
- Use `start_date` and `end_date` for time-limited content
- API automatically filters expired content
- Leave null for permanent content

### 5. Metadata Usage
Store additional structured data in the `metadata` field:
```json
{
  "metadata": {
    "discount_code": "SUMMER50",
    "min_purchase": 100,
    "banner_image_url": "https://...",
    "cta_button_text": "Shop Now",
    "cta_link": "/products/summer-sale"
  }
}
```

---

## Support

For issues or questions:
- Email: support@canzey.com
- Documentation: https://docs.canzey.com
- API Status: https://status.canzey.com

---

**Last Updated:** January 3, 2026  
**API Version:** 1.0.0
