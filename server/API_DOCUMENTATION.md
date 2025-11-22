# Firebase Customer API – Simple Guide

## Base URL
```
http://localhost:5000/api/firebase/customer
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
  `POST http://localhost:5000/api/firebase/customer/signup`

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
    "phone_number": "+1-555-1234"
  }
  ```

- **You receive**
  - `success: true`
  - MySQL customer data
  - `firebase_uid`

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
  `POST http://localhost:5000/api/firebase/customer/signin`

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
  `GET http://localhost:5000/api/firebase/customer/info`

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

**Postman example**

- **URL**  
  `PUT http://localhost:5000/api/firebase/customer/edit`

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
    "profile_url": "https://example.com/photo.png"
  }
  ```

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
      "status": "active"
    }
  }
  ```

Note: edits go only to **MySQL**.

---

## SUPER SIMPLE SUMMARY

| Step | Who sends request?     | Token used       | API / Action                     |
|------|------------------------|------------------|----------------------------------|
| 1    | Flutter / Postman      | none             | `POST /signup`                   |
| 2    | Flutter (Firebase SDK) | none             | Firebase login                   |
| 3    | Flutter / Postman      | Firebase ID token| `POST /signin` (gets our JWT)    |
| 4    | Flutter / Postman      | our JWT token    | `GET /info`                      |
| 5    | Flutter / Postman      | our JWT token    | `PUT /edit`                      |

---

## Database: `customers` table

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255),
  profile_url VARCHAR(500),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  address VARCHAR(500),
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  firebase_uid VARCHAR(255) UNIQUE,
  firebase_email VARCHAR(255),
  auth_method ENUM('local', 'firebase') DEFAULT 'local',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_firebase_uid (firebase_uid),
  INDEX idx_status (status)
);
```

---

## Environment Variables (Required)

```env
# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=canzey-2ba6a
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_CLIENT_ID=xxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=xxx

# Firebase Web
FIREBASE_WEB_API_KEY=...
FIREBASE_WEB_AUTH_DOMAIN=...
FIREBASE_WEB_PROJECT_ID=...
FIREBASE_WEB_STORAGE_BUCKET=...
FIREBASE_WEB_MESSAGING_SENDER_ID=...
FIREBASE_WEB_APP_ID=...
FIREBASE_WEB_MEASUREMENT_ID=...

# Email
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# JWT
JWT_SECRET=your-secret-key

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=canzey-app-db
```

---

## Notes

- Timestamps are in UTC.
- Firebase hashes and stores passwords.
- Email verification and password reset are handled by Firebase.
- Our JWT tokens expire in 24 hours.
- Customer status can be: `active`, `inactive`, `suspended`.
