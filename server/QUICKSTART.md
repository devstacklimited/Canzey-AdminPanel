# Canzey Server - Quick Start Guide

## ✅ Setup Complete!

Your server is now properly structured with:
- ✅ Clean ES6 module structure (like fmb-merchant-portal)
- ✅ MySQL database setup with `canzey-app-db`
- ✅ Authentication routes (signin, signup, logout, me)
- ✅ JWT token-based authentication
- ✅ Master admin user auto-creation
- ✅ Role-based access control

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Database
Edit `.env` file:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=canzey-app-db
ADMIN_EMAIL=admin@canzey.com
ADMIN_PASS=Admin@123456
```

### 3. Start Server
```bash
npm start
```

Server will automatically:
- ✅ Create database `canzey-app-db`
- ✅ Create tables (admin_users, customers, sessions)
- ✅ Create master admin user
- ✅ Start on port 5000

---

## 📝 Database Schema

### admin_users Table
```
id, first_name, last_name, email, phone_number, password_hash, 
role, profile_url, status, last_login, created_at, updated_at
```

### customers Table
```
id, first_name, last_name, email, phone_number, profile_url, 
status, address, city, country, postal_code, created_at, updated_at
```

### sessions Table
```
id, admin_user_id, token, expires_at, created_at
```

---

## 🔐 Authentication

### Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@canzey.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "first_name": "Master",
    "last_name": "Admin",
    "email": "admin@canzey.com",
    "role": "super_admin",
    "status": "active"
  }
}
```

### Create New User (Admin Only)
```bash
POST /api/auth/signup
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@canzey.com",
  "phone_number": "+1-555-0123",
  "password": "SecurePass123",
  "role": "manager"
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 👥 User Roles

- **super_admin** - Full system access
- **admin** - Can create/manage users
- **manager** - Can manage staff
- **staff** - Basic access

---

## 📋 Default Credentials

**Email:** `admin@canzey.com`  
**Password:** `Admin@123456`  
**Role:** `super_admin`

⚠️ **Change password after first login!**

---

## 🛠️ Development

### Run in Dev Mode
```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

---

## 📚 File Structure

```
server/
├── config/
│   └── database.js              # MySQL pool connection
├── database/
│   └── setup.js                 # DB initialization & seeding
├── middleware/
│   └── auth.js                  # JWT & role middleware
├── routes/
│   └── auth.js                  # Auth endpoints
├── .env                         # Environment variables
├── server.js                    # Main server file
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🔒 Security

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens (24h expiration)
- ✅ Parameterized SQL queries
- ✅ Role-based access control
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production

---

## 🐛 Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASS in .env
- Verify MySQL user has CREATE DATABASE privilege

### Port Already in Use
- Change PORT in .env
- Or kill process using port 5000

### Database Not Created
- Check MySQL logs
- Verify database user permissions
- Restart server

---

## ✨ Next Steps

1. ✅ Start server with `npm start`
2. ✅ Sign in with master admin credentials
3. ✅ Create additional admin/staff users
4. ✅ Integrate with frontend
5. ✅ Add customer management endpoints
6. ✅ Add order/inventory endpoints

---

## 📞 Support

Check these files for more info:
- `server.js` - Server configuration
- `database/setup.js` - Database setup
- `routes/auth.js` - Authentication routes
- `middleware/auth.js` - Authentication middleware
