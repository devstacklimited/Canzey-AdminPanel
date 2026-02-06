# FCM Token API Documentation

## Overview
This API allows managing Firebase Cloud Messaging (FCM) tokens for push notifications.

## Endpoints

### 1. Sign Up with FCM Token
**POST** `/api/firebase/customer/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "fcm_token": "fcm_token_here"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "fcm_token": "fcm_token_here"
  }
}
```

### 2. Sign In with FCM Token
**POST** `/api/firebase/customer/signin`

**Request Body:**
```json
{
  "firebase_token": "firebase_id_token_here",
  "fcm_token": "fcm_token_here"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "fcm_token": "fcm_token_here"
  }
}
```

### 3. Update FCM Token
**PUT** `/api/firebase/customer/fcm-token`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "fcm_token": "new_fcm_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  -- ... other fields
  fcm_token VARCHAR(500) NULL,
  -- ... other fields
);
```

## Usage Examples

### Flutter/Dart
```dart
// Sign up with FCM token
Future<void> signUpWithFCM() async {
  final fcmToken = await FirebaseMessaging.instance.getToken();
  
  final response = await http.post(
    Uri.parse('https://admin.canzey.com/api/firebase/customer/signup'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'email': 'user@example.com',
      'password': 'password123',
      'first_name': 'John',
      'last_name': 'Doe',
      'fcm_token': fcmToken,  // Include FCM token
    }),
  );
}

// Sign in with FCM token
Future<void> signInWithFCM() async {
  final fcmToken = await FirebaseMessaging.instance.getToken();
  final firebaseToken = await FirebaseAuth.instance.currentUser?.getIdToken();
  
  final response = await http.post(
    Uri.parse('https://admin.canzey.com/api/firebase/customer/signin'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'firebase_token': firebaseToken,
      'fcm_token': fcmToken,  // Include FCM token
    }),
  );
}

// Update FCM token separately
Future<void> updateFCMToken() async {
  final fcmToken = await FirebaseMessaging.instance.getToken();
  final jwtToken = await SecureStorage.read('auth_token');
  
  final response = await http.put(
    Uri.parse('https://admin.canzey.com/api/firebase/customer/fcm-token'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $jwtToken',
    },
    body: json.encode({
      'fcm_token': fcmToken,
    }),
  );
}
```

### cURL
```bash
# Sign up with FCM token
curl -X POST https://admin.canzey.com/api/firebase/customer/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "fcm_token": "fcm_token_here"
  }'

# Sign in with FCM token
curl -X POST https://admin.canzey.com/api/firebase/customer/signin \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_token": "firebase_id_token_here",
    "fcm_token": "fcm_token_here"
  }'

# Update FCM token
curl -X PUT https://admin.canzey.com/api/firebase/customer/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token_here" \
  -d '{
    "fcm_token": "new_fcm_token_here"
  }'
```

## Notes

- FCM token is optional in signup/signin
- FCM token can be updated separately using the dedicated endpoint
- Tokens are stored in the `customers` table
- Use the FCM tokens to send push notifications to specific users
- Tokens can be null if user hasn't granted notification permissions
