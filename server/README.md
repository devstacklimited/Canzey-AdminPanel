# Canzey Admin Panel - Server

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MySQL credentials.

4. Create the database and table:
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

5. Start the server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /health` - Health check

## Environment Variables

- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL user (default: root)
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: canzey_admin)
- `DB_PORT` - MySQL port (default: 3306)
- `PORT` - Server port (default: 5000)
