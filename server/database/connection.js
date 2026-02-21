import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'canzey-app-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ⚠️ Return DATETIME columns as plain strings, not JS Date objects.
  // Without this, mysql2 converts to UTC Date objects which shifts times
  // when serialized to JSON (e.g. 05:00 stored → 03:00 returned in UTC-2).
  dateStrings: true,
});

export default pool;
