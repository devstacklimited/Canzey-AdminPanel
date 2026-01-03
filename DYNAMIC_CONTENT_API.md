# Dynamic Content API Documentation

## Overview
This API allows you to manage dynamic content (promos, ads, notifications, banners, etc.) that can be displayed in your Flutter app without requiring app updates.

---

## Base URL
```
http://localhost:5000/api/content
```

---

## Endpoints

### 1. **Get All Active Content (Grouped by Type)**
Fetch all active content organized by type for easy consumption in your Flutter app.

**Endpoint:** `GET /active`

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
        "created_at": "2026-01-03T10:00:00.000Z",
        "updated_at": "2026-01-03T10:00:00.000Z"
      }
    ],
    "banner": [...],
    "notification": [...]
  }
}
```

**Flutter Example:**
```dart
Future<Map<String, List<dynamic>>> fetchAllContent() async {
  final response = await http.get(
    Uri.parse('http://your-server.com/api/content/active'),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['content'];
  }
  throw Exception('Failed to load content');
}
```

---

### 2. **Get Content by Type**
Fetch all active content of a specific type.

**Endpoint:** `GET /type/:type`

**Parameters:**
- `type`: Content type (promo, ad, notification, banner, popup, other)

**Example:** `GET /type/promo`

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
      "priority": 1
    }
  ]
}
```

**Flutter Example:**
```dart
Future<List<dynamic>> fetchPromos() async {
  final response = await http.get(
    Uri.parse('http://your-server.com/api/content/type/promo'),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['content'];
  }
  throw Exception('Failed to load promos');
}
```

---

### 3. **Get Content by Key**
Fetch a specific content item by its unique key.

**Endpoint:** `GET /key/:key`

**Parameters:**
- `key`: Unique key name (e.g., `home_welcome_banner`)

**Example:** `GET /key/home_welcome_banner`

**Response:**
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
    "priority": 1
  }
}
```

**Flutter Example:**
```dart
Future<Map<String, dynamic>> fetchContentByKey(String key) async {
  final response = await http.get(
    Uri.parse('http://your-server.com/api/content/key/$key'),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['content'];
  }
  throw Exception('Content not found');
}

// Usage
final welcomeBanner = await fetchContentByKey('home_welcome_banner');
print(welcomeBanner['description']); // "Get 20% off on your first order..."
```

---

## Admin Endpoints (Protected)

### 4. **Get All Content (Admin)**
**Endpoint:** `GET /admin`

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

### 5. **Create Content (Admin)**
**Endpoint:** `POST /admin`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "key_name": "summer_sale_2026",
  "title": "Summer Sale!",
  "description": "Get up to 50% off on selected items",
  "content_type": "promo",
  "status": "active",
  "priority": 5,
  "start_date": "2026-06-01T00:00:00",
  "end_date": "2026-08-31T23:59:59"
}
```

---

### 6. **Update Content (Admin)**
**Endpoint:** `PUT /admin/:id`

---

### 7. **Delete Content (Admin)**
**Endpoint:** `DELETE /admin/:id`

---

### 8. **Toggle Status (Admin)**
**Endpoint:** `PATCH /admin/:id/status`

**Body:**
```json
{
  "status": "active" // or "inactive"
}
```

---

## Content Types

- **promo**: Promotional offers and discounts
- **ad**: Advertisements
- **notification**: System notifications
- **banner**: Banner images/text
- **popup**: Popup messages
- **other**: Custom content

---

## Flutter Integration Example

### Complete Service Class

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ContentService {
  static const String baseUrl = 'http://your-server.com/api/content';

  // Fetch all active content
  Future<Map<String, List<dynamic>>> fetchAllContent() async {
    final response = await http.get(Uri.parse('$baseUrl/active'));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Map<String, List<dynamic>>.from(data['content']);
    }
    throw Exception('Failed to load content');
  }

  // Fetch content by type
  Future<List<dynamic>> fetchByType(String type) async {
    final response = await http.get(Uri.parse('$baseUrl/type/$type'));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return List<dynamic>.from(data['content']);
    }
    throw Exception('Failed to load content');
  }

  // Fetch content by key
  Future<Map<String, dynamic>?> fetchByKey(String key) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/key/$key'));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['content'];
      }
    } catch (e) {
      print('Content not found: $key');
    }
    return null;
  }
}
```

### Usage in Flutter Widget

```dart
class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ContentService _contentService = ContentService();
  Map<String, dynamic>? welcomeBanner;
  List<dynamic> promos = [];

  @override
  void initState() {
    super.initState();
    loadContent();
  }

  Future<void> loadContent() async {
    // Load welcome banner
    final banner = await _contentService.fetchByKey('home_welcome_banner');
    
    // Load all promos
    final promoList = await _contentService.fetchByType('promo');
    
    setState(() {
      welcomeBanner = banner;
      promos = promoList;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Column(
        children: [
          // Display welcome banner
          if (welcomeBanner != null)
            Container(
              padding: EdgeInsets.all(16),
              color: Colors.blue,
              child: Column(
                children: [
                  Text(
                    welcomeBanner!['title'],
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    welcomeBanner!['description'],
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
          
          // Display promos
          Expanded(
            child: ListView.builder(
              itemCount: promos.length,
              itemBuilder: (context, index) {
                final promo = promos[index];
                return ListTile(
                  title: Text(promo['title']),
                  subtitle: Text(promo['description']),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Best Practices

1. **Cache Content**: Cache fetched content locally to reduce API calls
2. **Refresh Strategy**: Refresh content on app launch or periodically
3. **Fallback**: Always have fallback content if API fails
4. **Priority**: Use the `priority` field to determine display order
5. **Date Filtering**: Content with start/end dates is automatically filtered by the API

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `404`: Content not found
- `400`: Bad request
- `401`: Unauthorized (admin endpoints)
- `500`: Server error
