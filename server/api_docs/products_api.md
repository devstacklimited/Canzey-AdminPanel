# Product Management API

## Base URL
```
https://admin.canzey.com/api/admin/products
```

**Authentication:**
- `GET /api/admin/products` is **public** (no auth) so mobile apps can list products.
- All **other product endpoints** (get single, create, update, delete, categories) require **admin authentication**.

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

Get all products with images, colors, sizes, tags, etc. This endpoint is **public**.

Each product can be **optionally linked to a Prize** via `campaign_id`:

- `campaign_id: null` → product is **not linked** to any prize
- `campaign_id: 3` → product is linked to prize with id **3** (see Campaigns/Prize API)

- **Method:** `GET`
- **URL:** `/api/admin/products`
- **Auth:** Not required

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
      "campaign_id": 1,
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
    "sub_category": "Smartphones",
    "for_gender": "Unisex",
    "is_customized": false,
    "tags": "New Arrival,Best Seller",
    "campaign_id": 1,
    "main_image_url": "/uploads/products/product-1234567890-123.jpg",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "images": [...],
    "colors": [...],
    "sizes": [...]
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
| campaign_id | integer | No | ID of the prize/campaign to link this product to (see [Prize Details](#accessing-prize-details-for-a-product)) |
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
   campaign_id: "1"
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
- **Storage (production):** `/home/canzey/public_html/admin.canzey.com/uploads/products/`
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

## Accessing Prize Details for a Product

When a product has a `campaign_id`, you can get full prize details (including **multiple images** and **linked products**) from the Campaigns/Prize API.

### 1. Get All Active Prizes with Linked Products

```http
GET https://admin.canzey.com/api/campaigns
```

Response includes all active prizes with their products and images:

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
        }
      ]
    }
  ]
}
```

### 2. Match a Product to Its Prize

When you have a product with `campaign_id`, match it to a campaign from the list above.

```dart
// Flutter/Dart example
final product = products.firstWhere((p) => p.id == productId);

if (product.campaignId != null) {
  final prize = campaigns.firstWhere((c) => c.id == product.campaignId);

  // Prize main image
  final String mainPrizeImage = prize.imageUrl; // or prize.images.first.imageUrl

  // Prize gallery images
  final List images = prize.images; // show as carousel

  // Linked products under this prize
  final List linkedProducts = prize.products;
}
```

### Product-Prize Relationship Summary

| Relationship | Description |
|--------------|-------------|
| Product → Prize | One product can link to **one** prize via `campaign_id` |
| Prize → Products | One prize can have **multiple** products linked to it |
| `campaign_id: null` | Product is not linked to any prize |
| `campaign_id: 1` | Product is linked to prize with id=1 |

