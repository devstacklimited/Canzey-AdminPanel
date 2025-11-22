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



# Campaign & Ticket APIs – Simple Guide

These APIs are for the **Flutter app** so customers can:

- See active campaigns
- Buy tickets (participate in a campaign)
- See their tickets
- See and use their credit balance (credits expire after 6 months)

## Base URL (Normal APIs)

```bash
http://localhost:5000/api
```

All these endpoints use **our backend JWT** in the header (same token returned by
`POST /api/firebase/customer/signin`).

Header example:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 1. List Active Campaigns (for Flutter)

**When?**  
Show a list of campaigns in the app (home screen).

**URL**  
`GET http://localhost:5000/api/campaigns`

**Headers**  
No auth required (public listing):

```http
Content-Type: application/json
```

**You receive (example)**

```json
[
  {
    "id": 1,
    "title": "iPhone 16 Giveaway",
    "description": "Win a brand new iPhone 16",
    "image_url": "/uploads/campaigns/campaign-123.jpg",
    "ticket_price": 10.0,
    "credits_per_ticket": 50,
    "max_tickets_per_user": 5,
    "status": "active",
    "start_at": "2025-11-01T00:00:00.000Z",
    "end_at": "2025-11-30T23:59:59.000Z"
  }
]
```

Use this data to show **title, image, price, credits per ticket, dates** in Flutter.

---

## 2. Participate in Campaign (Buy Ticket)

**When?**  
User taps **"Participate" / "Buy Ticket"** in Flutter.

**What happens?**

- Backend checks campaign is **active** and within **start/end date**
- Checks **max tickets per user** limit
- Creates a **ticket** row for this user and campaign
- Calculates credits and stores them with **6‑month expiry**

### 2.1 Endpoint

- **URL**  
  `POST http://localhost:5000/api/campaigns/:id/participate`

  `:id` = campaign id (e.g. `1`)

- **Headers**

  ```http
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```

- **Body**

  ```json
  {
    "quantity": 1
  }
  ```

  - `quantity` is optional, default = `1`, allowed: `1` to `10`.

### 2.2 Response (success)

```json
{
  "success": true,
  "message": "Successfully participated in campaign",
  "ticket": {
    "id": 3,
    "ticket_number": "TKT-MB3GJ4-AB12C",
    "campaign_title": "iPhone 16 Giveaway",
    "quantity": 1,
    "total_price": 10.0,
    "credits_earned": 50,
    "expires_at": "2026-05-22T10:00:00.000Z"
  }
}
```

**Flutter usage**: show `ticket_number` and `credits_earned` on a success screen.

### 2.3 How the database stores this

1. **campaign_tickets** (user has this ticket for this campaign)

   ```sql
   INSERT INTO campaign_tickets (
     campaign_id,
     customer_id,
     ticket_number,
     quantity,
     total_price,
     credits_earned
   ) VALUES (...);
   ```

   Example row:

   | id | campaign_id | customer_id | ticket_number        | quantity | total_price | credits_earned | status | created_at |
   |----|-------------|-------------|----------------------|----------|------------:|----------------|--------|-----------|
   | 3  | 1           | 5           | TKT-MB3GJ4-AB12C     | 1        | 10.00       | 50             | active | ...       |

2. **customer_credits** (wallet entry – credits for this ticket)

   ```sql
   INSERT INTO customer_credits (
     customer_id,
     ticket_id,
     credits,
     type,
     description,
     expires_at
   ) VALUES (..., 'earned', 'Earned from campaign: iPhone 16', expires_at);
   ```

   Example row:

   | id | customer_id | ticket_id | credits | type    | description                         | expires_at           |
   |----|-------------|----------:|--------:|---------|-------------------------------------|----------------------|
   | 7  | 5           | 3         | 50      | earned  | Earned from campaign: iPhone 16     | 2026‑05‑22 10:00:00 |

Credits expire automatically by **date logic**: we only count rows where
`expires_at > NOW()`.

---

## 3. Get Customer Credit Balance (Wallet)

**When?**  
Wallet screen / profile screen needs to show available credits.

- **URL**  
  `GET http://localhost:5000/api/customer/credits`

- **Headers**

  ```http
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```

- **Body**  
  None

**Response (example)**

```json
{
  "success": true,
  "balance": {
    "available": 120,
    "total_earned": 150,
    "total_spent": 30
  }
}
```

- `available` = credits user can use now (earned & not expired – spent).

---

## 4. Get Customer Tickets (My Tickets Screen)

**When?**  
User opens **"My Tickets"** screen in the app.

- **URL**  
  `GET http://localhost:5000/api/customer/tickets`

- **Headers**

  ```http
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```

**Response (example)**

```json
{
  "success": true,
  "tickets": [
    {
      "id": 3,
      "ticket_number": "TKT-MB3GJ4-AB12C",
      "quantity": 1,
      "total_price": 10.0,
      "credits_earned": 50,
      "status": "active",
      "created_at": "2025-11-22T10:00:00.000Z",
      "campaign_title": "iPhone 16 Giveaway",
      "campaign_image": "/uploads/campaigns/campaign-123.jpg"
    }
  ]
}
```

Use this list directly to render a **ticket history** in Flutter.

---

## 5. Get Customer Credit History (Optional)

**When?**  
Show detailed wallet history: where credits came from / where they were spent.

- **URL**  
  `GET http://localhost:5000/api/customer/credits/history`

- **Headers**

  ```http
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```

**Response (example)**

```json
{
  "success": true,
  "history": [
    {
      "id": 7,
      "credits": 50,
      "type": "earned",
      "description": "Earned from campaign: iPhone 16 Giveaway",
      "expires_at": "2026-05-22T10:00:00.000Z",
      "created_at": "2025-11-22T10:00:00.000Z",
      "ticket_number": "TKT-MB3GJ4-AB12C"
    }
  ]
}
```

You can use `type` + `description` to show a nice wallet timeline in Flutter.
