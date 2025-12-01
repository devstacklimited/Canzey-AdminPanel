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

---



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

- `available` = credits user can use now (earned & not expired – spent).

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

# Product Management API

## Base URL
```
https://admin.canzey.com/api/admin/products
```

**Authentication Required:** All product endpoints require admin authentication.

---

## Authentication

All product API requests must include:

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json (for JSON requests)
```

To get an admin token:
```http
POST https://admin.canzey.com/api/admin/signin
Content-Type: application/json

{
  "email": "admin@canzey.com",
  "password": "Admin@123456"
}
```

---

## 1. List All Products

Get all products with images.

- **Method:** `GET`
- **URL:** `/api/admin/products`
- **Auth:** Required (Admin)

### Request Example (Postman)

```http
GET https://admin.canzey.com/api/admin/products
Authorization: Bearer <your-admin-token>
```

### Response Example

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest iPhone with amazing features",
      "sku": "IP15PRO-001",
      "price": "999.00",
      "sale_price": "899.00",
      "stock_quantity": 50,
      "category": "Electronics",
      "sub_category": "Smartphones",
      "for_gender": "Unisex",
      "is_customized": false,
      "tags": "New Arrival,Best Seller",
      "main_image_url": "/uploads/products/product-1234567890-123.jpg",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "images": [
        {
          "id": 1,
          "image_url": "/uploads/products/product-1234567890-123.jpg",
          "is_primary": true,
          "sort_order": 0
        }
      ],
      "colors": [
        {
          "id": 1,
          "name": "Black",
          "code": "#000000",
          "stock_quantity": 25
        },
        {
          "id": 2,
          "name": "White",
          "code": "#FFFFFF",
          "stock_quantity": 25
        }
      ],
      "sizes": [
        {
          "id": 1,
          "size": "128GB",
          "stock_quantity": 30
        },
        {
          "id": 2,
          "size": "256GB",
          "stock_quantity": 20
        }
      ]
    }
  ]
}
```

---

## 2. Get Single Product

Get detailed information about a specific product.

- **Method:** `GET`
- **URL:** `/api/admin/products/:id`
- **Auth:** Required (Admin)

### Request Example

```http
GET https://admin.canzey.com/api/admin/products/1
Authorization: Bearer <your-admin-token>
```

### Response Example

```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest iPhone with amazing features",
    "sku": "IP15PRO-001",
    "price": "999.00",
    "sale_price": "899.00",
    "stock_quantity": 50,
    "category": "Electronics",
    "main_image_url": "/uploads/products/product-1234567890-123.jpg",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "images": [...]
  }
}
```

---

## 3. Create Product (with Image Upload)

Create a new product with images uploaded from PC.

- **Method:** `POST`
- **URL:** `/api/admin/products`
- **Auth:** Required (Admin)
- **Content-Type:** `multipart/form-data` (for file uploads)

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| slug | string | No | URL-friendly name |
| description | text | No | Product description |
| sku | string | No | Stock keeping unit (unique) |
| price | decimal | Yes | Regular price |
| sale_price | decimal | No | Discounted price |
| stock_quantity | integer | No | Available quantity |
| category | string | No | Product category |
| sub_category | string | No | Product sub-category |
| for_gender | enum | No | `Men`, `Women`, `Kids`, `Unisex` |
| is_customized | boolean | No | Whether product is customizable |
| tags | string | No | Comma-separated tags (e.g., "Summer,New Arrival") |
| colors | JSON string | No | Array of color objects |
| sizes | JSON string | No | Array of size objects |
| status | enum | No | 'active', 'inactive', or 'draft' |
| images | file[] | No | Up to 10 image files (5MB each) |

### Colors Format (JSON string)
```json
[
  {"name": "Black", "code": "#000000", "stock_quantity": 0},
  {"name": "White", "code": "#FFFFFF", "stock_quantity": 0}
]
```

### Sizes Format (JSON string)
```json
[
  {"size": "S", "stock_quantity": 0},
  {"size": "M", "stock_quantity": 0},
  {"size": "L", "stock_quantity": 0}
]
```

### Request Example (Postman)

1. Select `POST` method
2. URL: `https://admin.canzey.com/api/admin/products`
3. Headers:
   ```
   Authorization: Bearer <your-admin-token>
   ```
4. Body → `form-data`:
   ```
   name: "Summer T-Shirt"
   slug: "summer-t-shirt"
   description: "Comfortable cotton t-shirt"
   sku: "TSH-001"
   price: "29.99"
   sale_price: "24.99"
   stock_quantity: "100"
   category: "Clothing"
   sub_category: "T-Shirts"
   for_gender: "Men"
   is_customized: "0"
   tags: "Summer,New Arrival,Best Seller"
   colors: '[{"name":"Black","code":"#000000","stock_quantity":0},{"name":"White","code":"#FFFFFF","stock_quantity":0}]'
   sizes: '[{"size":"S","stock_quantity":0},{"size":"M","stock_quantity":0},{"size":"L","stock_quantity":0}]'
   status: "active"
   images: [Select file 1]
   images: [Select file 2]
   ```

### Response Example

```json
{
  "success": true,
  "product_id": 5
}
```

---

## 4. Update Product (with Image Upload)

Update an existing product. Can add new images while keeping existing ones.

- **Method:** `PUT`
- **URL:** `/api/admin/products/:id`
- **Auth:** Required (Admin)
- **Content-Type:** `multipart/form-data`

### Request Fields

Same as Create Product, plus:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| existing_images | JSON string | No | Array of existing image URLs to keep |

### Request Example (Postman)

1. Select `PUT` method
2. URL: `https://admin.canzey.com/api/admin/products/5`
3. Headers:
   ```
   Authorization: Bearer <your-admin-token>
   ```
4. Body → `form-data`:
   ```
   name: "iPhone 15 Pro Max"
   price: "1099"
   stock_quantity: "30"
   existing_images: ["/uploads/products/product-123.jpg", "/uploads/products/product-456.jpg"]
   images: [Select new file if any]
   ```

### Response Example

```json
{
  "success": true
}
```

---

## 5. Delete Product

Soft delete a product (sets status to 'inactive').

- **Method:** `DELETE`
- **URL:** `/api/admin/products/:id`
- **Auth:** Required (Admin)

### Request Example

```http
DELETE https://admin.canzey.com/api/admin/products/5
Authorization: Bearer <your-admin-token>
```

### Response Example

```json
{
  "success": true
}
```

---

## 6. List Categories

Get all available product categories.

- **Method:** `GET`
- **URL:** `/api/admin/products/categories/list/all`
- **Auth:** Required (Admin)

### Request Example

```http
GET https://admin.canzey.com/api/admin/products/categories/list/all
Authorization: Bearer <your-admin-token>
```

### Response Example

```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets"
    },
    {
      "id": 2,
      "name": "Clothing",
      "slug": "clothing",
      "description": "Fashion and apparel"
    }
  ]
}
```

---

## Product Categories (Static Options)

When creating/updating products, you can use these category values:

- Electronics
- Clothing
- Home & Garden
- Sports & Outdoors
- Books
- Toys & Games
- Health & Beauty
- Food & Beverages
- Other

---

## Product Sub-Categories (Static Options)

**Clothing:**
- T-Shirts, Shirts, Jeans, Trousers, Dresses, Skirts, Jackets, Sweaters, Shoes, Accessories

**Electronics:**
- Smartphones, Laptops, Tablets, Headphones, Cameras, Smart Watches

**Home & Garden:**
- Furniture, Decor, Kitchen, Bedding, Garden Tools

**Sports:**
- Gym Equipment, Outdoor Gear, Sports Apparel

**Other:**
- Books, Toys, Beauty, Food, Other

---

## Predefined Tags

Available tags for products:
- New Arrival
- Summer
- Winter
- Spring
- Fall
- Best Seller
- Trending
- Sale
- Limited Edition
- Exclusive

---

## Predefined Colors

| Color Name | Hex Code |
|------------|----------|
| Black | #000000 |
| White | #FFFFFF |
| Red | #EF4444 |
| Blue | #3B82F6 |
| Navy | #1E3A5F |
| Green | #22C55E |
| Yellow | #EAB308 |
| Orange | #F97316 |
| Pink | #EC4899 |
| Purple | #A855F7 |
| Gray | #6B7280 |
| Brown | #92400E |
| Beige | #D4A574 |
| Maroon | #7F1D1D |
| Teal | #14B8A6 |

---

## Predefined Sizes

Available sizes for products:
- XS
- S
- M
- L
- XL
- XXL
- 3XL

---

## Gender Options

- Men
- Women
- Kids
- Unisex

---

## Image Upload Details

### Specifications
- **Max files:** 10 images per product
- **Max size:** 5MB per image
- **Allowed types:** JPG, PNG, GIF, WEBP
- **Storage:** `server/public/uploads/products/`
- **URL format:** `/uploads/products/product-<timestamp>-<random>.jpg`

### First Image
- The first uploaded image automatically becomes the `main_image_url`
- This is the primary image shown in product listings

### Accessing Images
Images are served statically:
```
https://admin.canzey.com/uploads/products/product-1234567890-123.jpg
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Name and price are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server error while creating product"
}
```

---

## Complete Workflow Example

### 1. Login as Admin
```http
POST https://admin.canzey.com/api/admin/signin
Content-Type: application/json

{
  "email": "admin@canzey.com",
  "password": "Admin@123456"
}
```
**Save the token from response**

### 2. Create a Product with Images
```http
POST https://admin.canzey.com/api/admin/products
Authorization: Bearer <your-token>
Content-Type: multipart/form-data

Form Data:
- name: "Samsung Galaxy S24"
- sku: "SGS24-001"
- price: "799"
- sale_price: "749"
- stock_quantity: "100"
- category: "Electronics"
- status: "active"
- images: [file1.jpg, file2.jpg, file3.jpg]
```

### 3. View Created Product
```http
GET https://admin.canzey.com/api/admin/products/6
Authorization: Bearer <your-token>
```

### 4. Update Product
```http
PUT https://admin.canzey.com/api/admin/products/6
Authorization: Bearer <your-token>
Content-Type: multipart/form-data

Form Data:
- price: "699"
- stock_quantity: "80"
```

### 5. Delete Product
```http
DELETE https://admin.canzey.com/api/admin/products/6
Authorization: Bearer <your-token>
```

---

## Notes

1. **Admin Authentication:** All endpoints require admin JWT token
2. **Image Upload:** Use `multipart/form-data` when uploading images
3. **JSON Request:** Use `application/json` for requests without images
4. **Soft Delete:** DELETE sets status to 'inactive', doesn't remove from database
5. **Image Storage:** Images stored in `server/public/uploads/products/`
6. **Stock Management:** Stock decreases automatically when orders are placed (if implemented)
7. **URL Format:** Image URLs are relative: `/uploads/products/filename.jpg`

---

## Pro Tips for Postman

1. **Save Token:** Use Postman environment variables for token
2. **File Upload:** Use Body → form-data → select "File" type for images
3. **Multiple Files:** Add multiple rows with same key "images" for multiple uploads
4. **Test Images:** Use placeholder images from https://via.placeholder.com/500
5. **Collection:** Save all product requests in a Postman collection

---
