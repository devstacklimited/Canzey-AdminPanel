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
      "category": "electronics",
      "image_url": "/uploads/campaigns/campaign-123.jpg",
      "ticket_price": 10.0,
      "credits_per_ticket": 50,
      "max_tickets_per_user": 5,
      "status": "active",
      "start_at": "2025-11-01T00:00:00.000Z",
      "end_at": "2025-11-30T23:59:59.000Z",
      "use_end_date": true,
      "images": [
        {
          "id": 10,
          "image_url": "/uploads/campaigns/campaign-123.jpg",
          "is_primary": true,
          "sort_order": 0
        },
        {
          "id": 11,
          "image_url": "/uploads/campaigns/campaign-123-side.jpg",
          "is_primary": false,
          "sort_order": 1
        }
      ],
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

Use this data to show **title, main image, extra gallery images, price, credits per ticket, dates, and linked products** in Flutter.

### Prize Categories

Each campaign/prize has a category to help users find what they're interested in:

**Available Categories:**
- `exclusive` - Limited edition prizes
- `cash` - Cash prizes
- `electronics` - Electronic devices
- `featured` - Featured prizes (default)
- `new` - New prizes
- `premium` - Premium prizes

**Use in Flutter:**
- Show category badges on campaign cards
- Filter campaigns by category
- Create separate sections for each category type

### Product-Prize Relationship

- **One Prize can have multiple Products** linked to it.
- **One Product can only be linked to one Prize** at a time.
- Products are linked via `campaign_id` field in the products table.
- When listing campaigns/prizes, the `products` array shows all linked products.
- Use the `images` array to show a **gallery** for each prize.

### Intelligent Hiding Logic

Campaigns are automatically filtered by the backend based on:
1.  **Availability**: Must have `status = 'active'` and `start_at <= NOW()`.
2.  **Date Limit**: If `use_end_date` is `true`, the prize hides as soon as `end_at` passes. If `use_end_date` is `false`, the prize **remains visible** regardless of the end date.
3.  **Stock Limit**: A prize automatically hides if it is **sold out** (no tickets remaining), regardless of dates.

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

Prizes now support **up to 5 images** each:

- First image becomes `image_url` (main image) on the campaign row
- All images are stored in `campaign_images` table and returned in `images` array

### Create Prize (with Multiple Images)

- **URL:** `POST https://admin.canzey.com/api/admin/campaigns`
- **Auth:** Admin JWT required
- **Content-Type:** `multipart/form-data`

**Request Fields (form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Prize title |
| description | text | No | Prize description |
| category | enum | No | `exclusive`, `cash`, `electronics`, `featured`, `new`, `premium` (default: featured) |
| images | file[] | No | Up to 5 prize images (max 5MB each, JPG/PNG/GIF/WEBP) |
| ticket_price | decimal | Yes | Price per ticket |
| credits_per_ticket | integer | Yes | Credits earned per ticket |
| max_tickets_per_user | integer | No | Max tickets one user can buy |
| status | enum | No | `active`, `inactive`, `closed` (default: active) |
| start_at | datetime | No | When prize becomes available |
| end_at | datetime | No | When prize ends |
| use_end_date | boolean | No | Whether to hide prize when `end_at` passes (default: true) |

**Postman Example:**

1. Method: `POST`
2. URL: `https://admin.canzey.com/api/admin/campaigns`
3. Headers: `Authorization: Bearer <admin-token>`
4. Body → `form-data`:
   ```
   title: "iPhone 16 Giveaway"
   description: "Win a brand new iPhone 16 Pro Max"
   category: "electronics"
   images: [Select file 1 from PC]
   images: [Select file 2 from PC]
   ticket_price: "10.00"
   credits_per_ticket: "50"
   max_tickets_per_user: "5"
   status: "active"
   start_at: "2025-12-01T00:00:00"
   end_at: "2025-12-31T23:59:59"
   use_end_date: "true"
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
    "category": "electronics",
    "image_url": "/uploads/campaigns/campaign-1234567890-123.jpg",
    "ticket_price": "10.00",
    "credits_per_ticket": 50,
    "max_tickets_per_user": 5,
    "status": "active",
    "start_at": "2025-12-01T00:00:00",
    "end_at": "2025-12-31T23:59:59",
    "use_end_date": true,
    "images": [
      {
        "id": 10,
        "image_url": "/uploads/campaigns/campaign-1234567890-123.jpg",
        "is_primary": true,
        "sort_order": 0
      }
    ]
  }
}
```

---

### Update Prize (with Multiple Images)

- **URL:** `PUT https://admin.canzey.com/api/admin/campaigns/:id`
- **Auth:** Admin JWT required
- **Content-Type:** `multipart/form-data`

You can:

- Keep some existing images
- Remove some images
- Add new images (up to total of 5)

**Extra Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category | enum | No | `exclusive`, `cash`, `electronics`, `featured`, `new`, `premium` |
| existing_images | JSON string | No | Array of existing image URLs to keep |

**Postman Example:**

1. Method: `PUT`
2. URL: `https://admin.canzey.com/api/admin/campaigns/1`
3. Headers: `Authorization: Bearer <admin-token>`
4. Body → `form-data`:
   ```
   title: "iPhone 16 Pro Max Giveaway"
   category: "premium"
   ticket_price: "15.00"
   existing_images: "[\"/uploads/campaigns/campaign-1234567890-123.jpg\"]"
   images: [Select new file to add another image]
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
- **Max files:** 5 images per prize
- **Max size:** 5MB per image
- **Allowed types:** JPG, PNG, GIF, WEBP
- **Storage (production):** `/uploads/campaigns/`
- **URL format:** `/uploads/campaigns/campaign-<timestamp>-<random>.jpg`

### Fields

- `image_url` (string)
  - Main image URL stored on `campaigns` table
  - Always equals the first image in `images` array (primary)

- `images` (array)
  - All images for this prize from `campaign_images` table
  - Each item has: `id`, `image_url`, `is_primary`, `sort_order`

### Accessing Prize Images

```text
https://admin.canzey.com/uploads/campaigns/campaign-1234567890-123.jpg
```

In mobile / frontend apps you usually:

- Use `image_url` for main thumbnail / banner
- Use `images` array to show a carousel / gallery

