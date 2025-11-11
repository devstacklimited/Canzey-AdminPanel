# 🚀 Canzey Admin Panel - Quick Setup Guide

## 📋 Prerequisites
- ✅ Node.js installed
- ✅ MySQL installed and running

---

## 🗄️ Step 1: Create MySQL Database

Open MySQL Command Line or MySQL Workbench:

```sql
CREATE DATABASE canzey_dashboard;
```

---

## ⚙️ Step 2: Configure Environment

Edit `.env` file in project root:

```env
# DATABASE CONFIGURATION
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here  # <-- UPDATE THIS!
DB_NAME=canzey_dashboard
DB_PORT=3306

# APPLICATION SETTINGS
PORT=5000
JWT_SECRET=canzey_dashboard_secret_key_2024
NODE_ENV=development
```

**Important:** Set your MySQL root password in `DB_PASSWORD`

---

## 📦 Step 3: Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies  
cd ../client
npm install
```

---

## 🏗️ Step 4: Setup Database Tables

Run the database setup script:

```bash
# From server folder
mysql -u root -p canzey_dashboard < database/setup.sql
```

Or copy-paste the contents of `server/database/setup.sql` into MySQL Workbench.

---

## 🚀 Step 5: Start the Server

```bash
# From server folder
npm start
```

**You should see:**
```
✓ Server is running on port 5000
🌐 API: http://localhost:5000
🏥 Health: http://localhost:5000/health
🔐 Default admin user created:
   📧 Email: admin@canzey.com
   🔑 Password: 123456
   🎯 Role: admin
```

---

## 🎨 Step 6: Start the Frontend

Open another terminal:

```bash
# From client folder
npm run dev
```

---

## 🔐 Step 7: Login

1. Open browser: `http://localhost:5173`
2. Login with admin credentials:
   - **Email**: `admin@canzey.com`
   - **Password**: `123456`

---

## 🎉 Done! 

Your Canzey Admin Panel is now running with:
- ✅ Authentication system
- ✅ MySQL database
- ✅ Default admin user
- ✅ Protected routes
- ✅ Modern UI

---

## 🛠️ Troubleshooting

### "Cannot find module 'bcryptjs'"
```bash
cd server
npm install
```

### Database connection error
- Check MySQL is running
- Verify `DB_PASSWORD` in `.env`
- Make sure database `canzey_dashboard` exists

### Server won't start
- Check if port 5000 is free
- Run `npm install` in server folder
- Check `.env` file configuration

---

## 📁 What Was Created

```
Canzey-AdminPanel/
├── server/
│   ├── config/database.js    # Database connection (uses .env)
│   ├── routes/auth.js        # Login/Signup API
│   ├── scripts/createAdmin.js # Manual admin creation script
│   └── database/setup.sql    # Database schema
├── client/
│   └── src/pages/auth/       # Login/Signup pages
├── .env                      # Configuration (DO NOT COMMIT)
└── QUICK_SETUP.md           # This guide
```

---

## 🔒 Security Notes

1. **Change default password** after first login
2. **Never commit `.env`** to Git (already in .gitignore)
3. **Use HTTPS** in production
4. **Update JWT_SECRET** for production

🎊 **You're all set! Happy coding!**
