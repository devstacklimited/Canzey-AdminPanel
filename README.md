# Canzey Admin Panel

A full-stack admin panel application with React frontend and Node.js/Express backend connected to MySQL database.

## Project Structure

```
Canzey-AdminPanel/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Node.js backend
    ├── config/
    │   └── database.js
    ├── controllers/
    │   └── userController.js
    ├── routes/
    │   └── userRoutes.js
    ├── server.js
    └── package.json
```

## Quick Start

### 1. Database Setup

Create MySQL database and table:

```sql
CREATE DATABASE canzey_admin;

USE canzey_admin;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:3000`

## Features

### Backend
- ✅ Express.js REST API
- ✅ MySQL database integration
- ✅ CRUD operations for users
- ✅ Environment configuration
- ✅ CORS enabled
- ✅ Error handling

### Frontend
- ✅ Modern React dashboard UI
- ✅ TailwindCSS styling
- ✅ Responsive design
- ✅ User management interface
- ✅ Real-time data fetching
- ✅ Search functionality
- ✅ Collapsible sidebar

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /health` - Health check

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL2
- dotenv
- CORS

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios
- React Router DOM
- Lucide React Icons

## Environment Variables

Create a `.env` file in the server directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=canzey_admin
DB_PORT=3306
PORT=5000
```

## License

MIT


# how to deploy 

cd ~/Canzey-AdminPanel
git pull origin main

# Create/update the .env with correct API URL
echo "VITE_API_URL=https://admin.canzey.com" > ~/Canzey-AdminPanel/client/.env

# Rebuild frontend
cd ~/Canzey-AdminPanel/client
npm install
npm run build

# Deploy
cp -r dist/* /home/canzey/admin.canzey.com/
chown -R canzey:canzey /home/canzey/admin.canzey.com/

# Restart backend if needed
cd ~/Canzey-AdminPanel/server
npm install
pm2 restart canzey-backend
