# Firebase Customer API – Simple Guide

## Base URL
```
https://admin.canzey.com/api/firebase/customer
```

---

## Tokens – Very Important

There are **two tokens**:

1. **Firebase Token (ID Token)**
   - Comes from `FirebaseAuth` in Flutter.
   - Short‑lived (~1 hour).
   - Used **only once** to sign in to your backend.

2. **Backend JWT Token** (our token)
   - Returned by `POST /signin`.
   - Used for:
     - `GET /info`
     - `PUT /edit`

---

## SIMPLE API FLOW

### Step 1 — Sign Up (Create Customer)

**When?**  
New user creates an account.

**What happens?**
- Backend creates Firebase user.
- Backend saves customer in MySQL.

**Postman example**

- **URL**  
  `POST https://admin.canzey.com/api/firebase/customer/signup`

- **Headers**
  ```
  Content-Type: application/json
  ```

- **Body**
  ```json
  {
    "email": "user@example.com",
    "password": "Test123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1-555-1234",
    "date_of_birth": "1995-06-15",
    "gender": "male"
  }
  ```

  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | email | string | Yes | User email |
  | password | string | Yes | Password (min 6 chars) |
  | first_name | string | Yes | First name |
  | last_name | string | Yes | Last name |
  | phone_number | string | No | Phone number |
  | date_of_birth | date | No | Format: YYYY-MM-DD |
  | gender | enum | No | `male`, `female`, `other`, `prefer_not_to_say` |

- **You receive**
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone_number": "+1-555-1234",
      "date_of_birth": "1995-06-15",
      "gender": "male",
      "firebase_uid": "abc123xyz",
      "status": "active"
    }
  }
  ```

---

### Step 2 — Firebase Login (in Flutter)

**When?**  
User logs in inside your Flutter app.

**What happens?**
- Flutter signs into Firebase and gets **Firebase ID token**.

**Flutter code**
```dart
final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
  email: email,
  password: password,
);
final idToken = await cred.user!.getIdToken();
```

Here:
- `idToken` = **firebase_token** you send to backend.

---

### Step 3 — Backend Signin (Exchange Token)

**When?**  
- After Flutter gets Firebase `idToken`.
- To receive **your backend JWT**.

**What happens?**
- Backend verifies Firebase token.
- Backend returns our JWT.
- Flutter stores JWT for future calls.

**Postman example**

- **URL**  
  `POST https://admin.canzey.com/api/firebase/customer/signin`

- **Headers**
  ```
  Content-Type: application/json
  ```

- **Body**
  ```json
  {
    "firebase_token": "<paste idToken here>"
  }
  ```

- **You receive**
  ```json
  {
    "success": true,
    "token": "our-jwt-token-here",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "customer@example.com",
      "phone_number": "+1-555-0123",
      "profile_url": null,
      "date_of_birth": "1995-06-15",
      "gender": "male",
      "status": "active",
      "firebase_uid": "ZiHYZ2jqEGZxlUkNNPcgYRmsyai2"
    }
  }
  ```

Save `token` → this is **our JWT**.

---

### Step 4 — Get Customer Info

**When?**  
- Show profile screen.  
- Fetch customer data.

**What happens?**
- You send **our JWT** in the header.
- Backend loads customer from MySQL.

**Postman example**

- **URL**  
  `GET https://admin.canzey.com/api/firebase/customer/info`

- **Headers**
  ```
  Content-Type: application/json
  Authorization: Bearer <your-jwt-token>
  ```

- **Body**
  - None

- **You receive**
  - Full customer record from MySQL (id, name, email, phone, status, etc.).

---

### Step 5 — Update Customer Info (Edit Profile)

**When?**  
- User edits profile in app.

**What happens?**
- You send updated fields.
- Backend updates **only MySQL** (not Firebase email/password).
- For **profile image**, you send a `profile_url` string (no file upload in this API).

**Postman example**

- **URL**  
  `PUT https://admin.canzey.com/api/firebase/customer/edit`

- **Headers**
  ```
  Content-Type: application/json
  Authorization: Bearer <your-jwt-token>
  ```

- **Body** (send only what you want to change)
  ```json
  {
    "first_name": "NewName",
    "phone_number": "+1-999-9999",
    "profile_url": "https://example.com/photo.png",
    "date_of_birth": "1995-06-15",
    "gender": "female"
  }
  ```

  | Field | Type | Required | Description |
|-------|------|----------|-------------|
| first_name | string | No | First name |
| last_name | string | No | Last name |
| phone_number | string | No | Phone number |
| profile_url | string | No | Profile picture URL (see **Profile Image Flow** below) |
| date_of_birth | date | No | Format: YYYY-MM-DD |
| gender | enum | No | `male`, `female`, `other`, `prefer_not_to_say` |

- **You receive**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      "id": 1,
      "first_name": "NewName",
      "last_name": "Doe",
      "email": "customer@example.com",
      "phone_number": "+1-999-9999",
      "profile_url": "https://example.com/photo.png",
      "date_of_birth": "1995-06-15",
      "gender": "female",
      "status": "active"
    }
  }
  ```

Note: edits go only to **MySQL**.

---

## Profile Image Flow (profile_url)

Profile images are stored on **our server** at `/uploads/customers/`. Both admin panel and Flutter app use the same `profile_url` field.

### 1. Where images are stored

- **Server folder:** `public/uploads/customers/`
- **Full URL format:** `https://admin.canzey.com/uploads/customers/customer-<timestamp>.jpg`
- The `profile_url` field in API responses contains the **relative path**, e.g. `/uploads/customers/customer-123456.jpg`

---

### 2. How Flutter DISPLAYS profile image

When you call any of these endpoints, the response includes `profile_url`:
- `POST /signin`
- `GET /info`
- `PUT /edit`
- `POST /avatar`

**Example Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "profile_url": "/uploads/customers/customer-1234567890.jpg",
    "status": "active"
  }
}
```

**Flutter code to display profile image:**

```dart
// Constants
const String baseUrl = 'https://admin.canzey.com';

// Build full image URL from profile_url
String? getFullImageUrl(String? profileUrl) {
  if (profileUrl == null || profileUrl.isEmpty) return null;
  if (profileUrl.startsWith('http')) return profileUrl;
  return '$baseUrl$profileUrl';
}

// Usage in Widget
Widget buildProfileImage(User user) {
  final imageUrl = getFullImageUrl(user.profileUrl);
  
  if (imageUrl != null) {
    return CircleAvatar(
      radius: 40,
      backgroundImage: NetworkImage(imageUrl),
      onBackgroundImageError: (_, __) {
        // Handle error - show placeholder
      },
    );
  } else {
    // Show initials placeholder
    return CircleAvatar(
      radius: 40,
      backgroundColor: Colors.purple,
      child: Text(
        '${user.firstName[0]}${user.lastName[0]}',
        style: TextStyle(color: Colors.white, fontSize: 20),
      ),
    );
  }
}
```

---

### 3. How Flutter UPLOADS/CHANGES profile image

**Endpoint:**
```http
POST https://admin.canzey.com/api/firebase/customer/avatar
Content-Type: multipart/form-data
Authorization: Bearer <customer-jwt-token>

Form field: avatar (file)
```

**Flutter code to upload:**

```dart
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ProfileService {
  static const String baseUrl = 'https://admin.canzey.com';

  /// Upload profile image and get updated user data
  static Future<Map<String, dynamic>?> uploadProfileImage(
    File imageFile,
    String token,
  ) async {
    try {
      final uri = Uri.parse('$baseUrl/api/firebase/customer/avatar');
      final request = http.MultipartRequest('POST', uri);
      
      // Add auth header
      request.headers['Authorization'] = 'Bearer $token';
      
      // Add image file
      request.files.add(
        await http.MultipartFile.fromPath('avatar', imageFile.path),
      );
      
      // Send request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          // Return updated user with new profile_url
          return data['user'];
        }
      }
      
      print('Upload failed: ${response.body}');
      return null;
    } catch (e) {
      print('Upload error: $e');
      return null;
    }
  }
}
```

**Usage in Flutter:**

```dart
// Pick image using image_picker package
final picker = ImagePicker();
final pickedFile = await picker.pickImage(source: ImageSource.gallery);

if (pickedFile != null) {
  final file = File(pickedFile.path);
  final token = await getStoredToken(); // Your auth token
  
  final updatedUser = await ProfileService.uploadProfileImage(file, token);
  
  if (updatedUser != null) {
    // Update local user state with new profile_url
    setState(() {
      user.profileUrl = updatedUser['profile_url'];
    });
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "profile_url": "/uploads/customers/customer-1234567890.jpg",
    "status": "active"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Avatar image is required"
}
```

---

### 4. How Admin uploads profile image

In the **Canzey Customers** admin page:
1. Click **Details** on any customer
2. Under **Profile Image**, click "Choose Image"
3. Select an image from your computer
4. Image uploads automatically and preview updates

**Admin endpoint (different from customer endpoint):**
```http
POST https://admin.canzey.com/api/admin/customers/:id/avatar
Content-Type: multipart/form-data
Authorization: Bearer <admin-jwt-token>

Form field: avatar (file)
```


---

## SUPER SIMPLE SUMMARY

| Step | Who sends request?     | Token used       | API / Action                     |
|------|------------------------|------------------|----------------------------------|
| 1    | Flutter / Postman      | none             | `POST /signup`                   |
| 2    | Flutter (Firebase SDK) | none             | Firebase login                   |
| 3    | Flutter / Postman      | Firebase ID token| `POST /signin` (gets our JWT)    |
| 4    | Flutter / Postman      | our JWT token    | `GET /info`                      |
| 5    | Flutter / Postman      | our JWT token    | `PUT /edit`                      |
