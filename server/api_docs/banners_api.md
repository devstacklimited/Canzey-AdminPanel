# Banners API Documentation

## Overview
The Banners API provides endpoints for managing promotional banners for the mobile app. Admins can create, update, delete, and toggle banners, while the mobile app can fetch active banners for display.

## Base URL
```
https://your-domain.com/api
```

## Authentication
Admin endpoints require JWT authentication with admin privileges. Public endpoints do not require authentication.

---

## Admin Endpoints

### 1. Create New Banner
**POST** `/api/admin/banners`

Create a new promotional banner with image upload.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Banner title (e.g., "Big Sale") |
| width | number | No | Banner width in pixels (default: 1080) |
| height | number | No | Banner height in pixels (default: 400) |
| priority | number | No | Display priority (higher = shown first, default: 0) |
| is_active | boolean | No | Banner visibility status (default: true) |
| link_url | string | No | URL to redirect when banner is tapped |
| image | file | Yes | Banner image file (JPG, PNG, etc.) |

**Request Example:**
```javascript
const formData = new FormData();
formData.append('title', 'Big Sale');
formData.append('width', 1080);
formData.append('height', 400);
formData.append('priority', 10);
formData.append('is_active', true);
formData.append('link_url', '/sale');
formData.append('image', fileInput.files[0]);

fetch('/api/admin/banners', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
})
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "banner": {
    "id": 1,
    "title": "Big Sale",
    "image_url": "/uploads/banners/1642681234567-banner.jpg",
    "width": 1080,
    "height": 400,
    "priority": 10,
    "is_active": true,
    "link_url": "/sale"
  }
}
```

---

### 2. Get All Banners
**GET** `/api/admin/banners`

Retrieve all banners (both active and inactive) for admin management.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "banners": [
    {
      "id": 1,
      "title": "Big Sale",
      "image_url": "/uploads/banners/1642681234567-banner.jpg",
      "width": 1080,
      "height": 400,
      "priority": 10,
      "is_active": true,
      "link_url": "/sale",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z"
    },
    {
      "id": 2,
      "title": "New Arrivals",
      "image_url": "/uploads/banners/1642681234568-banner.jpg",
      "width": 1080,
      "height": 400,
      "priority": 5,
      "is_active": false,
      "link_url": "/new",
      "created_at": "2024-01-20T11:00:00.000Z",
      "updated_at": "2024-01-20T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Update Banner
**PUT** `/api/admin/banners/:id`

Update an existing banner's details and optionally replace the image.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Banner ID to update |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | Updated banner title |
| width | number | No | Updated banner width |
| height | number | No | Updated banner height |
| priority | number | No | Updated display priority |
| is_active | boolean | No | Updated visibility status |
| link_url | string | No | Updated redirect URL |
| image | file | No | New banner image (optional) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "banner": {
    "id": 1,
    "title": "Updated Sale",
    "image_url": "/uploads/banners/1642681234569-banner.jpg",
    "width": 1080,
    "height": 400,
    "priority": 15,
    "is_active": true,
    "link_url": "/updated-sale"
  }
}
```

---

### 4. Delete Banner
**DELETE** `/api/admin/banners/:id`

Permanently delete a banner and its associated image file.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Banner ID to delete |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

### 5. Toggle Banner Status
**PATCH** `/api/admin/banners/:id/toggle`

Quick toggle a banner's active status without updating other fields.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Banner ID to toggle |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| is_active | boolean | Yes | New active status (true/false) |

**Request Example:**
```json
{
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Banner status updated successfully",
  "is_active": false
}
```

---

## Public Endpoints (Mobile App)

### 6. Get Active Banners
**GET** `/api/v1/public/banners`

Retrieve all active banners ordered by priority for display in the mobile app.

**No authentication required.**

**Response (200 OK):**
```json
{
  "success": true,
  "banners": [
    {
      "id": 1,
      "title": "Big Sale",
      "image_url": "/uploads/banners/1642681234567-banner.jpg",
      "width": 1080,
      "height": 400,
      "priority": 10,
      "link_url": "/sale"
    },
    {
      "id": 3,
      "title": "Limited Offer",
      "image_url": "/uploads/banners/1642681234570-banner.jpg",
      "width": 1080,
      "height": 400,
      "priority": 8,
      "link_url": "/limited"
    }
  ]
}
```

**Flutter Integration Example:**
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class BannerModel {
  final int id;
  final String title;
  final String imageUrl;
  final String? linkUrl;

  BannerModel({required this.id, required this.title, required this.imageUrl, this.linkUrl});

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    // Note: Always join image_url with your API Base URL
    const String baseUrl = 'https://admin.canzey.com';
    return BannerModel(
      id: json['id'],
      title: json['title'] ?? '',
      imageUrl: baseUrl + json['image_url'],
      linkUrl: json['link_url'],
    );
  }
}

Future<List<BannerModel>> fetchBanners() async {
  final response = await http.get(
    Uri.parse('https://admin.canzey.com/api/v1/public/banners'),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    if (data['success'] == true) {
      List<dynamic> list = data['banners'];
      return list.map((b) => BannerModel.fromJson(b)).toList();
    }
  }
  return [];
}
```

**Mobile App Integration Example:**
```javascript
// Fetch active banners for mobile app
fetch('https://your-api.com/api/v1/public/banners')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const banners = data.data;
      // Display banners in mobile app
      banners.forEach(banner => {
        console.log(`Banner: ${banner.title}`);
        console.log(`Image: ${banner.image_url}`);
        console.log(`Link: ${banner.link_url}`);
      });
    }
  })
  .catch(error => {
    console.error('Error fetching banners:', error);
  });
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and image are required"
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

### 404 Not Found
```json
{
  "success": false,
  "message": "Banner not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Database connection failed"
}
```

---

## Image Upload Guidelines

- **Supported Formats:** JPG, JPEG, PNG, GIF, WEBP
- **Max File Size:** 10MB
- **Recommended Dimensions:** 1080x400px (mobile banner)
- **Storage Location:** `/uploads/banners/`
- **File Naming:** `{timestamp}-{original-filename}`

---

## Priority System

- **Higher numbers = Higher priority**
- **Banners are sorted by priority DESC, then created_at DESC**
- **Priority 0** = lowest priority
- **Priority 100** = highest priority
- **Same priority** = newer banners shown first

---

## Mobile App Implementation Tips

1. **Cache banners** for offline viewing
2. **Refresh banners** when app opens or user pulls to refresh
3. **Handle image loading errors** gracefully
4. **Resize images** appropriately for mobile display
5. **Implement tap handlers** for link_url navigation
6. **Show loading states** while fetching banners
7. **Handle empty state** when no active banners exist

---

## Rate Limiting

- **Admin endpoints:** 100 requests per minute per admin
- **Public endpoints:** 1000 requests per minute per IP
- **Image uploads:** 10 uploads per minute per admin

---

## Webhook Support (Optional)

You can configure webhooks to receive notifications when:
- New banner is created
- Banner is updated/deleted
- Banner status is toggled

Contact your system administrator to set up webhooks.
