# Admin Authentication API

These endpoints are used by the **admin panel (React app)** to authenticate admin users.

## Base URL

```http
https://admin.canzey.com/api/admin
```

---

## 1. Admin Sign In

Used by the admin login screen.

- **Method:** `POST`
- **URL:** `/api/admin/signin`

### Request

```http
POST https://admin.canzey.com/api/admin/signin
Content-Type: application/json

{
  "email": "admin@canzey.com",
  "password": "Admin@123456"
}
```

### Response (example)

```json
{
  "success": true,
  "token": "<admin-jwt-token>",
  "user": {
    "id": 1,
    "first_name": "Master",
    "last_name": "Admin",
    "email": "admin@canzey.com",
    "phone_number": null,
    "profile_url": null,
    "role": "super_admin",
    "status": "active"
  }
}
```

Save the `token` and send it as `Authorization: Bearer <token>` for all admin APIs.

---

## 2. Get Admin User Info

Used by the admin panel to load current admin profile.

- **Method:** `GET`
- **URL:** `/api/admin/userinfo`
- **Auth:** Required (Admin JWT)

### Request

```http
GET https://admin.canzey.com/api/admin/userinfo
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

### Response (example)

```json
{
  "success": true,
  "user": {
    "id": 1,
    "first_name": "Master",
    "last_name": "Admin",
    "email": "admin@canzey.com",
    "phone_number": null,
    "profile_url": null,
    "role": "super_admin",
    "status": "active"
  }
}
```

---

## 3. Admin Logout

- **Method:** `POST`
- **URL:** `/api/admin/logout`
- **Auth:** Required (Admin JWT)

### Request

```http
POST https://admin.canzey.com/api/admin/logout
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

### Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 4. Get All Customers

Used by the admin panel to list all customers.

- **Method:** `GET`
- **URL:** `/api/admin/customers`
- **Auth:** Required (Admin JWT)

### Request

```http
GET https://admin.canzey.com/api/admin/customers
Authorization: Bearer <admin-jwt-token>
```

### Response (example)

```json
{
  "success": true,
  "customers": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "profile_url": "/uploads/customers/customer-123.jpg",
      "status": "active",
      "firebase_uid": "abc123xyz",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "fcm_token": "fcm_token_here_or_null"
    }
  ]
}
```

---

## 5. Get Customer Details

Used by the admin panel when clicking "Details" on a customer.

- **Method:** `GET`
- **URL:** `/api/admin/customers/:id`
- **Auth:** Required (Admin JWT)

### Request

```http
GET https://admin.canzey.com/api/admin/customers/1
Authorization: Bearer <admin-jwt-token>
```

### Response (example)

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "profile_url": "/uploads/customers/customer-123.jpg",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "status": "active",
    "firebase_uid": "abc123xyz",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "fcm_token": "fcm_token_here_or_null"
  }
}
```

**Response Fields:**
- `id` (number): Customer ID
- `first_name` (string): First name
- `last_name` (string): Last name
- `email` (string): Email address
- `phone_number` (string/null): Phone number
- `profile_url` (string/null): Profile image URL
- `date_of_birth` (string/null): Date of birth (YYYY-MM-DD)
- `gender` (string/null): Gender (`male`, `female`, `other`, `prefer_not_to_say`)
- `status` (string): Account status (`active`, `inactive`, `suspended`)
- `firebase_uid` (string): Firebase user ID
- `created_at` (string): Account creation timestamp
- `updated_at` (string): Last update timestamp
- `fcm_token` (string/null): FCM token for push notifications

---

## Notes

- All **Product Management** endpoints reuse the same admin JWT from `POST /api/admin/signin`.
- Protect all admin routes in your client by checking that the token exists and is valid.
- Customer details now include FCM token for push notification management.
