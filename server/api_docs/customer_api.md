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
  | profile_url | string | No | Profile picture URL |
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

## SUPER SIMPLE SUMMARY

| Step | Who sends request?     | Token used       | API / Action                     |
|------|------------------------|------------------|----------------------------------|
| 1    | Flutter / Postman      | none             | `POST /signup`                   |
| 2    | Flutter (Firebase SDK) | none             | Firebase login                   |
| 3    | Flutter / Postman      | Firebase ID token| `POST /signin` (gets our JWT)    |
| 4    | Flutter / Postman      | our JWT token    | `GET /info`                      |
| 5    | Flutter / Postman      | our JWT token    | `PUT /edit`                      |
