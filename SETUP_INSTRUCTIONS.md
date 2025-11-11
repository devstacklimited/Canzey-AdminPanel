# 🚀 Canzey Admin Panel - Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

---

## 📊 Step 1: Setup MySQL Database

### 1.1 Create Database
Open MySQL command line or workbench and run:

```sql
CREATE DATABASE canzey_dashboard;
USE canzey_dashboard;
```

### 1.2 Run Database Setup Script
Execute the SQL script located at:
```
server/database/setup.sql
```

You can run it using:
```bash
mysql -u root -p canzey_dashboard < server/database/setup.sql
```

Or copy and paste the contents into your MySQL client.

---

## 📦 Step 2: Install Dependencies

### 2.1 Install Server Dependencies
```bash
cd server
npm install
```

### 2.2 Install Client Dependencies
```bash
cd ../client
npm install
```

---

## ⚙️ Step 3: Configure Database Connection

Update the database configuration in:
```
server/config/db.js
```

Change the password to match your MySQL root password:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'YOUR_MYSQL_PASSWORD', // Update this
  database: 'canzey_dashboard'
};
```

---

## 🎯 Step 4: Create Admin User

### Option A: Using the Signup Page
1. Start the servers (see Step 5)
2. Navigate to `http://localhost:5173/signup`
3. Register with:
   - Email: `admin@canzey.com`
   - Password: `123456`
   - Name: `Admin`

### Option B: Using API Directly
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@canzey.com",
    "password": "123456",
    "name": "Admin",
    "role": "admin"
  }'
```

---

## 🚀 Step 5: Run the Application

### 5.1 Start Backend Server
Open terminal in server folder:
```bash
cd server
npm start
```

Server will run on: `http://localhost:5000`

### 5.2 Start Frontend (Vite)
Open another terminal in client folder:
```bash
cd client
npm run dev
```

Client will run on: `http://localhost:5173`

---

## 🔐 Step 6: Login

1. Open browser and go to: `http://localhost:5173`
2. You'll see the login page
3. Login with:
   - **Email**: `admin@canzey.com`
   - **Password**: `123456`

---

## 📁 Project Structure

```
Canzey-AdminPanel/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/          # Login & Signup
│   │   │   ├── home/          # Dashboard
│   │   │   ├── orders/        # Orders Management
│   │   │   └── inventory/     # Inventory Management
│   │   ├── components/
│   │   │   ├── sidebar/       # Navigation
│   │   │   ├── header/        # Top Bar
│   │   │   └── layout/        # Page Layout
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js             # Database Connection
│   ├── routes/
│   │   ├── auth.js           # Authentication Routes
│   │   └── userRoutes.js     # User Routes
│   ├── database/
│   │   └── setup.sql         # Database Schema
│   ├── server.js             # Server Entry Point
│   └── package.json
│
└── .env                        # Environment Variables
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

---

## 🛠️ Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check database credentials in `server/config/db.js`
- Verify database `canzey_dashboard` exists

### Port Already in Use
- **Backend (5000)**: Change port in `server/server.js`
- **Frontend (5173)**: Vite will auto-assign another port

### CORS Errors
- Backend has CORS enabled for all origins in development
- Check `server/server.js` if issues persist

---

## 🔒 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Change JWT_SECRET** in production (use environment variable)
3. **Use strong passwords** for production admin accounts
4. **Enable HTTPS** when deploying to production

---

## 📝 Default Credentials

**Admin Account:**
- Email: `admin@canzey.com`
- Password: `123456`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

---

## 🎉 You're Ready!

Your Canzey Admin Panel is now set up and running!
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: MySQL on localhost

For deployment instructions, see `.env` file comments.
