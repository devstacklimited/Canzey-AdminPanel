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

## Notes

- All **Product Management** endpoints reuse the same admin JWT from `POST /api/admin/signin`.
- Protect all admin routes in your client by checking that the token exists and is valid.
