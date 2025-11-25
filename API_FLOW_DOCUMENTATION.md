# Canzey Admin Panel - Complete API Flow Documentation

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [How API Calls Work](#how-api-calls-work)
4. [Authentication Flow](#authentication-flow)
5. [Products API Flow (Complete Example)](#products-api-flow-complete-example)
6. [Request/Response Lifecycle](#requestresponse-lifecycle)
7. [All Available APIs](#all-available-apis)

---

## 🏗️ Project Structure

```
Canzey-AdminPanel/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── pages/                   # Page Components (UI)
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx        # Login page - makes API calls
│   │   │   ├── products/
│   │   │   │   └── Products.jsx     # Products page - makes API calls
│   │   │   ├── campaigns/
│   │   │   ├── customers/
│   │   │   └── ...
│   │   ├── components/              # Reusable UI Components
│   │   ├── context/                 # React Context (State Management)
│   │   │   └── UserContext.jsx      # Stores user data & token
│   │   └── App.jsx                  # Main app with routing
│   ├── package.json                 # Dependencies: react, axios, etc.
│   └── .env                         # Environment variables (API URL)
│
├── server/                          # Backend Node.js/Express Application
│   ├── server.js                    # Main server file - Entry point
│   ├── routes/                      # API Route Definitions
│   │   ├── admin_auth.js            # Auth routes (/api/admin/signin, etc.)
│   │   ├── admin_products.js        # Product routes (/api/admin/products)
│   │   ├── admin_campaigns.js       # Campaign routes
│   │   └── ...
│   ├── controllers/                 # Business Logic
│   │   ├── adminController.js       # Auth logic (login, signup, verify)
│   │   ├── productController.js     # Product CRUD logic
│   │   └── ...
│   ├── middleware/                  # Middleware Functions
│   │   ├── auth.js                  # JWT authentication & authorization
│   │   └── productUpload.js         # File upload handling (multer)
│   ├── database/                    # Database Connection & Setup
│   │   ├── connection.js            # MySQL connection pool
│   │   └── setup.js                 # Database initialization
│   └── package.json                 # Dependencies: express, mysql2, etc.
```

---

## 🛠️ Technology Stack

### **Client (Frontend)**
- **React 18** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client (not heavily used, mostly native `fetch`)
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework

### **Server (Backend)**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

---

## 🔄 How API Calls Work

### **Step-by-Step Flow:**

```
┌─────────────┐         HTTP Request          ┌─────────────┐
│   CLIENT    │ ──────────────────────────────▶│   SERVER    │
│  (React)    │                                │  (Express)  │
│             │                                │             │
│  Products   │   1. User clicks "Add Product" │             │
│  .jsx       │   2. Form data collected       │             │
│             │   3. fetch() API call          │             │
└─────────────┘                                └─────────────┘
      │                                               │
      │  POST http://localhost:5000/api/admin/products
      │  Headers: { Authorization: "Bearer <token>" }
      │  Body: FormData (name, price, images, etc.)
      │                                               │
      ▼                                               ▼
                                            ┌──────────────────┐
                                            │  Middleware      │
                                            │  1. CORS         │
                                            │  2. Auth Check   │
                                            │  3. File Upload  │
                                            └──────────────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  Route Handler   │
                                            │  admin_products  │
                                            │  .js             │
                                            └──────────────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  Controller      │
                                            │  productController│
                                            │  .createProduct()│
                                            └──────────────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │  Database        │
                                            │  MySQL           │
                                            │  INSERT product  │
                                            └──────────────────┘
                                                     │
      ┌──────────────────────────────────────────────┘
      │
      │  Response: { success: true, product_id: 123 }
      │
      ▼
┌─────────────┐
│   CLIENT    │  4. Receive response
│             │  5. Update UI
│             │  6. Show success message
└─────────────┘
```

---

## 🔐 Authentication Flow

### **1. Login Process**

**Client Side (`client/src/pages/auth/Login.jsx`):**
```javascript
// User enters email and password
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Step 1: Make API call to server
  const response = await fetch('http://localhost:5000/api/admin/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@canzey.com',
      password: 'Admin@123456'
    })
  });

  const data = await response.json();
  
  // Step 2: Store token and user data
  if (data.success) {
    login(data.user, data.token);  // Saves to localStorage
    navigate('/dashboard');
  }
};
```

**Server Side (`server/routes/admin_auth.js`):**
```javascript
// Step 3: Route receives the request
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  // Step 4: Call controller to handle business logic
  const result = await adminSignIn(email, password);
  
  // Step 5: Send response back to client
  res.json(result);
});
```

**Controller (`server/controllers/adminController.js`):**
```javascript
export async function adminSignIn(email, password) {
  // Step 6: Query database
  const [users] = await connection.execute(
    'SELECT * FROM admins WHERE email = ?',
    [email]
  );
  
  // Step 7: Verify password
  const isValid = await bcrypt.compare(password, user.password);
  
  // Step 8: Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Step 9: Return user data and token
  return {
    success: true,
    user: { id, email, name, role },
    token
  };
}
```

### **2. Authenticated Requests**

After login, all subsequent requests include the JWT token:

```javascript
// Client sends token in Authorization header
const response = await fetch('http://localhost:5000/api/admin/products', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

**Server Middleware (`server/middleware/auth.js`):**
```javascript
export const authenticateToken = (req, res, next) => {
  // Step 1: Extract token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Step 2: Verify token
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  // Step 3: Attach user to request
  req.user = user;
  next();  // Continue to route handler
};
```

---

## 📦 Products API Flow (Complete Example)

Let me walk you through a complete example of creating a product.

### **CLIENT SIDE**

**File: `client/src/pages/products/Products.jsx`**

```javascript
// 1. USER FILLS FORM
const [formData, setFormData] = useState({
  name: '',
  price: '',
  description: '',
  // ... other fields
});

const [selectedImages, setSelectedImages] = useState([]);

// 2. USER SUBMITS FORM
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 3. GET TOKEN FROM LOCALSTORAGE
    const token = localStorage.getItem('token');
    
    // 4. PREPARE API ENDPOINT
    const url = 'http://localhost:5000/api/admin/products';
    
    // 5. CREATE FORMDATA (for file uploads)
    const formDataToSend = new FormData();
    
    // 6. ADD TEXT FIELDS
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('sku', formData.sku);
    formDataToSend.append('stock_quantity', formData.stock_quantity);
    formDataToSend.append('status', formData.status);
    
    // 7. ADD IMAGE FILES
    selectedImages.forEach(file => {
      formDataToSend.append('images', file);
    });

    // 8. MAKE API CALL
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData, browser sets it automatically
      },
      body: formDataToSend
    });

    // 9. PARSE RESPONSE
    const data = await response.json();

    // 10. HANDLE RESPONSE
    if (data.success) {
      setToast({ type: 'success', message: 'Product created!' });
      fetchProducts();  // Refresh product list
      setShowModal(false);  // Close modal
    } else {
      setToast({ type: 'error', message: data.error });
    }
  } catch (error) {
    console.error('Error:', error);
    setToast({ type: 'error', message: 'Error saving product' });
  } finally {
    setLoading(false);
  }
};
```

### **SERVER SIDE**

**File: `server/server.js` (Main Entry Point)**

```javascript
import express from 'express';
import cors from 'cors';
import adminProductsRoutes from './routes/admin_products.js';

const app = express();

// MIDDLEWARE
app.use(cors());  // Allow cross-origin requests
app.use(express.json());  // Parse JSON bodies

// ROUTES
app.use('/api/admin/products', adminProductsRoutes);

// START SERVER
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
```

**File: `server/routes/admin_products.js` (Route Handler)**

```javascript
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import productUpload from '../middleware/productUpload.js';
import { createProduct } from '../controllers/productController.js';

const router = express.Router();

// ROUTE: POST /api/admin/products
router.post('/', 
  authenticateToken,                    // 1. Verify JWT token
  requireAdmin,                         // 2. Check if user is admin
  productUpload.array('images', 10),    // 3. Handle file uploads (max 10)
  async (req, res) => {
    try {
      const productData = req.body;
      
      // 4. Process uploaded images
      if (req.files && req.files.length > 0) {
        productData.image_urls = req.files.map(file => 
          `/uploads/products/${file.filename}`
        );
      }
      
      // 5. Call controller
      const result = await createProduct(productData);

      // 6. Send response
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.error 
        });
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
);

export default router;
```

**File: `server/middleware/auth.js` (Authentication)**

```javascript
export const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Verify token
  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Attach user to request object
  req.user = user;  // { userId, email, role }
  next();  // Continue to next middleware
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
```

**File: `server/middleware/productUpload.js` (File Upload)**

```javascript
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/products/');  // Save location
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const productUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB max
});

export default productUpload;
```

**File: `server/controllers/productController.js` (Business Logic)**

```javascript
import pool from '../database/connection.js';

export async function createProduct(productData) {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      slug,
      description,
      sku,
      price,
      sale_price,
      stock_quantity,
      status = 'active',
      category,
      sub_category,
      for_gender,
      is_customized = false,
      image_urls = [],
    } = productData;

    // Validation
    if (!name || price === undefined) {
      return { success: false, error: 'Name and price are required' };
    }

    // Start transaction
    await connection.beginTransaction();

    // Insert product
    const [result] = await connection.execute(
      `INSERT INTO products 
       (name, slug, description, sku, price, sale_price, stock_quantity, 
        category, sub_category, for_gender, is_customized, main_image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug || null,
        description || null,
        sku || null,
        price,
        sale_price || null,
        stock_quantity || 0,
        category || null,
        sub_category || null,
        for_gender || null,
        is_customized || false,
        image_urls[0] || null,  // First image as main
        status,
      ]
    );

    const productId = result.insertId;

    // Insert product images
    if (image_urls.length > 0) {
      const values = image_urls.map((url, index) => [
        productId,
        url,
        null,  // alt_text
        index === 0,  // is_primary
        index,  // sort_order
      ]);

      await connection.query(
        `INSERT INTO product_images 
         (product_id, image_url, alt_text, is_primary, sort_order) 
         VALUES ?`,
        [values]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    return { 
      success: true, 
      product_id: productId, 
      message: 'Product created successfully' 
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    
    console.error('Error creating product:', error);
    return { success: false, error: 'Server error while creating product' };
  }
}
```

**File: `server/database/connection.js` (Database)**

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canzey_admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
```

---

## 🔄 Request/Response Lifecycle

### **Complete Flow Diagram:**

```
CLIENT                          SERVER
------                          ------

1. User Action
   └─ Click "Add Product"
   
2. Collect Form Data
   └─ name, price, images, etc.
   
3. Create FormData Object
   └─ Append all fields
   
4. Get Auth Token
   └─ localStorage.getItem('token')
   
5. Make HTTP Request ─────────────▶ 6. Server Receives Request
   POST /api/admin/products           └─ Express app
   Headers: Authorization                
   Body: FormData                    7. CORS Middleware
                                        └─ Allow cross-origin
                                        
                                     8. Body Parser Middleware
                                        └─ Parse request body
                                        
                                     9. Route Matching
                                        └─ /api/admin/products
                                        
                                     10. Auth Middleware
                                         └─ Verify JWT token
                                         └─ Check if admin
                                         
                                     11. File Upload Middleware
                                         └─ Save images to disk
                                         └─ Add file paths to req.files
                                         
                                     12. Route Handler
                                         └─ Extract data from req.body
                                         └─ Process file paths
                                         
                                     13. Controller Function
                                         └─ Validate data
                                         └─ Start DB transaction
                                         
                                     14. Database Query
                                         └─ INSERT INTO products
                                         └─ INSERT INTO product_images
                                         └─ COMMIT transaction
                                         
                                     15. Build Response
                                         └─ { success: true, product_id: 123 }
                                         
16. Receive Response ◀─────────────── 17. Send Response
    └─ Parse JSON                        └─ res.json(result)
    
18. Update UI
    └─ Show success message
    └─ Refresh product list
    └─ Close modal
```

---

## 📚 All Available APIs

### **Authentication APIs**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/signin` | Admin login | No |
| POST | `/api/admin/signup` | Create new admin | Yes (Admin) |
| GET | `/api/admin/userinfo` | Get current user info | Yes |
| PUT | `/api/admin/edit` | Update admin info | Yes |
| POST | `/api/admin/logout` | Logout | Yes |

### **Products APIs**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/products` | List all products | Yes (Admin) |
| GET | `/api/admin/products/:id` | Get single product | Yes (Admin) |
| POST | `/api/admin/products` | Create product | Yes (Admin) |
| PUT | `/api/admin/products/:id` | Update product | Yes (Admin) |
| PATCH | `/api/admin/products/:id/status` | Update product status | Yes (Admin) |
| DELETE | `/api/admin/products/:id` | Delete product | Yes (Admin) |

### **Campaigns APIs**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/campaigns` | List all campaigns | Yes (Admin) |
| POST | `/api/admin/campaigns` | Create campaign | Yes (Admin) |
| PUT | `/api/admin/campaigns/:id` | Update campaign | Yes (Admin) |
| DELETE | `/api/admin/campaigns/:id` | Delete campaign | Yes (Admin) |

### **Customers APIs**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/customers` | List all customers | Yes (Admin) |
| POST | `/api/firebase/customer/signin` | Customer login (Firebase) | No |
| POST | `/api/firebase/customer/signup` | Customer signup (Firebase) | No |

---

## 🔑 Key Concepts

### **1. JWT Authentication**
- Token generated on login
- Stored in localStorage on client
- Sent with every request in Authorization header
- Verified by middleware on server
- Contains user info (id, email, role)

### **2. Middleware Chain**
Every request goes through multiple middleware functions:
1. **CORS** - Allow cross-origin requests
2. **Body Parser** - Parse JSON/FormData
3. **Authentication** - Verify token
4. **Authorization** - Check user role
5. **File Upload** - Handle file uploads
6. **Route Handler** - Process request
7. **Error Handler** - Catch errors

### **3. Database Connection**
- Uses MySQL connection pool
- Transactions for data integrity
- Prepared statements to prevent SQL injection

### **4. File Uploads**
- Multer middleware handles file uploads
- Files saved to `server/public/uploads/products/`
- File paths stored in database
- Images served as static files

### **5. Error Handling**
- Try-catch blocks in controllers
- Consistent error response format
- HTTP status codes (200, 201, 400, 401, 403, 500)

---

## 🎯 Summary

**How it all works:**

1. **User interacts with UI** (React component)
2. **Client makes HTTP request** (fetch/axios)
3. **Request includes auth token** (JWT in header)
4. **Server receives request** (Express)
5. **Middleware processes request** (auth, file upload, etc.)
6. **Route handler calls controller** (business logic)
7. **Controller queries database** (MySQL)
8. **Database returns data**
9. **Controller formats response**
10. **Server sends response** (JSON)
11. **Client receives response**
12. **UI updates** (React state)

This architecture follows the **MVC pattern** (Model-View-Controller) with clear separation of concerns:
- **View** = React components (client)
- **Controller** = Express routes + controllers (server)
- **Model** = Database queries (server)

---

**Created by:** Canzey Development Team  
**Last Updated:** November 2025
