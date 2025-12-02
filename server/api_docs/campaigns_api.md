# Campaign & Ticket APIs – Simple Guide

These APIs are for the **Flutter app** so customers can:

- See active campaigns
- Buy tickets (participate in a campaign)
- See their tickets
- See and use their credit balance (credits expire after 6 months)

## Base URL (Normal APIs)

```bash
https://admin.canzey.com/api
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
`GET https://admin.canzey.com/api/campaigns`

**Headers**  
No auth required (public listing):

```http
Content-Type: application/json
```

**You receive (example)**

```json
{
  "success": true,
  "campaigns": [
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
      "end_at": "2025-11-30T23:59:59.000Z",
      "products": [
        {
          "id": 5,
          "name": "iPhone 16 Pro Max",
          "main_image_url": "/uploads/products/product-123.jpg",
          "price": "1199.00"
        },
        {
          "id": 6,
          "name": "iPhone 16 Case",
          "main_image_url": "/uploads/products/product-456.jpg",
          "price": "49.00"
        }
      ]
    }
  ]
}
```

Use this data to show **title, image, price, credits per ticket, dates, and linked products** in Flutter.

### Product-Prize Relationship

- **One Prize can have multiple Products** linked to it.
- **One Product can only be linked to one Prize** at a time.
- Products are linked via `campaign_id` field in the products table.
- When listing campaigns/prizes, the `products` array shows all linked products.

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
  `POST https://admin.canzey.com/api/campaigns/:id/participate`

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
  `GET https://admin.canzey.com/api/customer/credits`

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

---

## 4. Get Customer Tickets (My Tickets Screen)

**When?**  
User opens **"My Tickets"** screen in the app.

- **URL**  
  `GET https://admin.canzey.com/api/customer/tickets`

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
  `GET https://admin.canzey.com/api/customer/credits/history`

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

---

## Admin: Create/Update Prize with Image Upload

These endpoints are for **admin panel** to manage prizes.

### Create Prize (with Image)

- **URL:** `POST https://admin.canzey.com/api/admin/campaigns`
- **Auth:** Admin JWT required
- **Content-Type:** `multipart/form-data`

**Request Fields (form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Prize title |
| description | text | No | Prize description |
| image | file | No | Prize image (max 5MB, JPG/PNG/GIF/WEBP) |
| ticket_price | decimal | Yes | Price per ticket |
| credits_per_ticket | integer | Yes | Credits earned per ticket |
| max_tickets_per_user | integer | No | Max tickets one user can buy |
| status | enum | No | `active`, `inactive`, `closed` (default: active) |
| start_at | datetime | No | When prize becomes available |
| end_at | datetime | No | When prize ends |

**Postman Example:**

1. Method: `POST`
2. URL: `https://admin.canzey.com/api/admin/campaigns`
3. Headers: `Authorization: Bearer <admin-token>`
4. Body → `form-data`:
   ```
   title: "iPhone 16 Giveaway"
   description: "Win a brand new iPhone 16 Pro Max"
   image: [Select file from PC]
   ticket_price: "10.00"
   credits_per_ticket: "50"
   max_tickets_per_user: "5"
   status: "active"
   start_at: "2025-12-01T00:00:00"
   end_at: "2025-12-31T23:59:59"
   ```

**Response:**

```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": {
    "id": 1,
    "title": "iPhone 16 Giveaway",
    "description": "Win a brand new iPhone 16 Pro Max",
    "image_url": "/uploads/campaigns/campaign-1234567890-123.jpg",
    "ticket_price": "10.00",
    "credits_per_ticket": 50,
    "max_tickets_per_user": 5,
    "status": "active",
    "start_at": "2025-12-01T00:00:00",
    "end_at": "2025-12-31T23:59:59"
  }
}
```

---

### Update Prize (with Image)

- **URL:** `PUT https://admin.canzey.com/api/admin/campaigns/:id`
- **Auth:** Admin JWT required
- **Content-Type:** `multipart/form-data`

**Postman Example:**

1. Method: `PUT`
2. URL: `https://admin.canzey.com/api/admin/campaigns/1`
3. Headers: `Authorization: Bearer <admin-token>`
4. Body → `form-data`:
   ```
   title: "iPhone 16 Pro Max Giveaway"
   image: [Select new file to replace image]
   ticket_price: "15.00"
   ```

**Response:**

```json
{
  "success": true,
  "message": "Campaign updated successfully"
}
```

---

### Delete Prize

- **URL:** `DELETE https://admin.canzey.com/api/admin/campaigns/:id`
- **Auth:** Admin JWT required

**Response:**

```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

## Prize Image Details

### Specifications
- **Max size:** 5MB per image
- **Allowed types:** JPG, PNG, GIF, WEBP
- **Storage:** `/uploads/campaigns/`
- **URL format:** `/uploads/campaigns/campaign-<timestamp>-<random>.jpg`

### Accessing Prize Images
```
https://admin.canzey.com/uploads/campaigns/campaign-1234567890-123.jpg
```
