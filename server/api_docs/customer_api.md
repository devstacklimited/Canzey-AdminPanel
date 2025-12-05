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

## Phone OTP Authentication (Firebase)

Firebase handles OTP sending and verification **entirely in Flutter**. No backend API changes needed - the existing `/signin` endpoint works with phone auth too!

### How it works

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUTTER APP                              │
├─────────────────────────────────────────────────────────────────┤
│  1. User enters phone number (+964xxxxxxxxxx)                   │
│  2. FirebaseAuth.verifyPhoneNumber() → Firebase sends SMS OTP   │
│  3. User enters 6-digit OTP code                                │
│  4. PhoneAuthCredential → signInWithCredential() → Firebase     │
│  5. Get Firebase ID Token → POST /signin to your backend        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR BACKEND (existing)                     │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/firebase/customer/signin                             │
│  - Receives firebase_token (same as email login)                │
│  - Verifies with Firebase Admin SDK ✅                          │
│  - Returns your JWT token                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Firebase Console Setup

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Enable **Phone** provider
3. For Android: Add **SHA-1** and **SHA-256** fingerprints in Project Settings
4. For iOS: Enable push notifications and add APNs key

### Flutter Code - Phone OTP

**Step 1: Send OTP to phone number**

```dart
import 'package:firebase_auth/firebase_auth.dart';

class PhoneAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  String? _verificationId;

  /// Send OTP to phone number
  Future<void> sendOTP({
    required String phoneNumber,  // Format: +964xxxxxxxxxx
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
    required Function(PhoneAuthCredential credential) onAutoVerify,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 60),
      
      // Called when code is sent successfully
      codeSent: (String verificationId, int? resendToken) {
        _verificationId = verificationId;
        onCodeSent(verificationId);
      },
      
      // Called on Android when OTP is auto-detected
      verificationCompleted: (PhoneAuthCredential credential) {
        onAutoVerify(credential);
      },
      
      // Called on error
      verificationFailed: (FirebaseAuthException e) {
        onError(e.message ?? 'Verification failed');
      },
      
      // Called when timeout expires
      codeAutoRetrievalTimeout: (String verificationId) {
        _verificationId = verificationId;
      },
    );
  }

  /// Verify OTP code entered by user
  Future<UserCredential?> verifyOTP(String otpCode) async {
    if (_verificationId == null) {
      throw Exception('Verification ID not found. Send OTP first.');
    }
    
    PhoneAuthCredential credential = PhoneAuthProvider.credential(
      verificationId: _verificationId!,
      smsCode: otpCode,
    );
    
    return await _auth.signInWithCredential(credential);
  }

  /// Get Firebase ID token after successful verification
  Future<String?> getFirebaseToken() async {
    return await _auth.currentUser?.getIdToken();
  }
}
```

**Step 2: After OTP verified, call your backend**

```dart
// After verifyOTP() succeeds:
final firebaseToken = await phoneAuthService.getFirebaseToken();

// Call your existing signin endpoint
final response = await http.post(
  Uri.parse('https://admin.canzey.com/api/firebase/customer/signin'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({'firebase_token': firebaseToken}),
);

final data = json.decode(response.body);
if (data['success']) {
  final jwtToken = data['token'];  // Your backend JWT
  final user = data['user'];
  // Save token and navigate to home
}
```

### Complete Phone Auth Screen Example

```dart
class PhoneAuthScreen extends StatefulWidget {
  @override
  _PhoneAuthScreenState createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _phoneAuthService = PhoneAuthService();
  
  bool _codeSent = false;
  bool _loading = false;

  Future<void> _sendOTP() async {
    setState(() => _loading = true);
    
    await _phoneAuthService.sendOTP(
      phoneNumber: _phoneController.text.trim(),
      onCodeSent: (verificationId) {
        setState(() {
          _codeSent = true;
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('OTP sent!')),
        );
      },
      onError: (error) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error)),
        );
      },
      onAutoVerify: (credential) async {
        // Android auto-verification
        await FirebaseAuth.instance.signInWithCredential(credential);
        _signInToBackend();
      },
    );
  }

  Future<void> _verifyOTP() async {
    setState(() => _loading = true);
    
    try {
      await _phoneAuthService.verifyOTP(_otpController.text.trim());
      await _signInToBackend();
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP')),
      );
    }
  }

  Future<void> _signInToBackend() async {
    final firebaseToken = await _phoneAuthService.getFirebaseToken();
    
    final response = await http.post(
      Uri.parse('https://admin.canzey.com/api/firebase/customer/signin'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'firebase_token': firebaseToken}),
    );
    
    final data = json.decode(response.body);
    
    if (data['success']) {
      // Save JWT token
      await SecureStorage.write('token', data['token']);
      // Navigate to home
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // User not registered - go to signup with phone
      Navigator.pushNamed(context, '/complete-profile', arguments: {
        'phone': _phoneController.text,
        'firebase_uid': FirebaseAuth.instance.currentUser?.uid,
      });
    }
    
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Phone Login')),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            if (!_codeSent) ...[
              TextField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  hintText: '+964xxxxxxxxxx',
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _sendOTP,
                child: _loading 
                  ? CircularProgressIndicator() 
                  : Text('Send OTP'),
              ),
            ] else ...[
              TextField(
                controller: _otpController,
                decoration: InputDecoration(
                  labelText: 'Enter OTP',
                  hintText: '123456',
                  prefixIcon: Icon(Icons.lock),
                ),
                keyboardType: TextInputType.number,
                maxLength: 6,
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _verifyOTP,
                child: _loading 
                  ? CircularProgressIndicator() 
                  : Text('Verify OTP'),
              ),
              TextButton(
                onPressed: () => setState(() => _codeSent = false),
                child: Text('Change phone number'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## Forgot Password (Firebase)

Firebase handles password reset entirely - **no backend API needed!**

### How it works

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUTTER APP                              │
├─────────────────────────────────────────────────────────────────┤
│  1. User taps "Forgot Password?"                                │
│  2. User enters their email                                     │
│  3. FirebaseAuth.sendPasswordResetEmail(email)                  │
│  4. Firebase sends reset link to email                          │
│  5. User clicks link → Firebase reset page opens                │
│  6. User enters new password → Done!                            │
│  7. User logs in with new password (normal signin flow)         │
└─────────────────────────────────────────────────────────────────┘
```

### Flutter Code - Forgot Password

**Simple function:**

```dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      // Success - email sent
    } on FirebaseAuthException catch (e) {
      switch (e.code) {
        case 'user-not-found':
          throw 'No account found with this email';
        case 'invalid-email':
          throw 'Invalid email address';
        default:
          throw e.message ?? 'Failed to send reset email';
      }
    }
  }
}
```

**Complete Forgot Password Screen:**

```dart
class ForgotPasswordScreen extends StatefulWidget {
  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  bool _emailSent = false;

  Future<void> _sendResetEmail() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _loading = true);
    
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(
        email: _emailController.text.trim(),
      );
      
      setState(() {
        _emailSent = true;
        _loading = false;
      });
    } on FirebaseAuthException catch (e) {
      setState(() => _loading = false);
      
      String message = 'Failed to send reset email';
      if (e.code == 'user-not-found') {
        message = 'No account found with this email';
      } else if (e.code == 'invalid-email') {
        message = 'Invalid email address';
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Forgot Password')),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: _emailSent ? _buildSuccessView() : _buildFormView(),
      ),
    );
  }

  Widget _buildFormView() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(Icons.lock_reset, size: 80, color: Colors.purple),
          SizedBox(height: 20),
          Text(
            'Enter your email address and we\'ll send you a link to reset your password.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
          ),
          SizedBox(height: 30),
          TextFormField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: _loading ? null : _sendResetEmail,
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _loading
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text('Send Reset Link', style: TextStyle(fontSize: 16)),
          ),
          SizedBox(height: 16),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Back to Login'),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.mark_email_read, size: 80, color: Colors.green),
        SizedBox(height: 20),
        Text(
          'Reset Link Sent!',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 12),
        Text(
          'We\'ve sent a password reset link to:\n${_emailController.text}',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: Colors.grey[600]),
        ),
        SizedBox(height: 8),
        Text(
          'Check your inbox and spam folder.',
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        SizedBox(height: 30),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Back to Login'),
        ),
        SizedBox(height: 12),
        TextButton(
          onPressed: () {
            setState(() => _emailSent = false);
          },
          child: Text('Didn\'t receive? Try again'),
        ),
      ],
    );
  }
}
```

### Customizing Reset Email (Optional)

You can customize the reset email template in **Firebase Console**:

1. Go to **Firebase Console** → **Authentication** → **Templates**
2. Click **Password reset**
3. Edit subject, sender name, and email body
4. You can also set a custom action URL if you want users to reset on your own website

### Error Handling

| Firebase Error Code | Meaning | User Message |
|---------------------|---------|--------------|
| `user-not-found` | Email not registered | "No account found with this email" |
| `invalid-email` | Bad email format | "Invalid email address" |
| `too-many-requests` | Rate limited | "Too many attempts. Try again later" |

---

### New User Registration with Phone

If user signs in with phone but doesn't exist in your database, they need to complete their profile:

```dart
// In your backend signin response, check if user exists
// If not, return success: false with message: "User not found"

// Then in Flutter, redirect to complete profile screen
// where user enters: first_name, last_name, email (optional)

// Call a new endpoint or modify signup to accept firebase_uid
```

**Optional: Add phone signup endpoint**

If you want users to register with phone number, you may need a new endpoint:

```http
POST /api/firebase/customer/phone-signup
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"  // optional
}
```

This would verify the Firebase token, extract the phone number, and create the customer in MySQL.

---

## Database Migration for Phone Auth

If your database already exists, run this SQL to enable phone OTP:

```sql
-- Make email nullable (phone users don't have email)
ALTER TABLE customers MODIFY COLUMN email VARCHAR(255) UNIQUE NULL;

-- Increase phone_number length for international formats
ALTER TABLE customers MODIFY COLUMN phone_number VARCHAR(50);

-- Add 'phone' to auth_method enum
ALTER TABLE customers MODIFY COLUMN auth_method ENUM('local', 'firebase', 'email', 'phone') DEFAULT 'local';

-- Add index on phone_number
ALTER TABLE customers ADD INDEX idx_phone (phone_number);
```

Or run the migration file: `server/database/migrations/add_phone_auth_support.sql`

---

## SUPER SIMPLE SUMMARY

| Step | Who sends request?     | Token used       | API / Action                     |
|------|------------------------|------------------|----------------------------------|
| 1    | Flutter / Postman      | none             | `POST /signup` (email signup)    |
| 2    | Flutter (Firebase SDK) | none             | Firebase login (email or phone)  |
| 3    | Flutter / Postman      | Firebase ID token| `POST /signin` (gets our JWT)    |
| 4    | Flutter / Postman      | our JWT token    | `GET /info`                      |
| 5    | Flutter / Postman      | our JWT token    | `PUT /edit`                      |
| 6    | Flutter / Postman      | our JWT token    | `POST /avatar`                   |

### Phone OTP Flow

| Step | Action |
|------|--------|
| 1 | User enters phone number (+964xxxxxxxxxx) |
| 2 | Flutter calls `FirebaseAuth.verifyPhoneNumber()` |
| 3 | Firebase sends SMS with 6-digit OTP |
| 4 | User enters OTP code |
| 5 | Flutter calls `signInWithCredential()` |
| 6 | Get Firebase ID token |
| 7 | `POST /signin` with token → Backend auto-creates user if new |
| 8 | Receive JWT → User is logged in! |
