import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function migrate() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Starting ALTER migration...');

    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'customers' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    const columnNames = columns.map(col => col.COLUMN_NAME);

    // Add firebase_uid if it doesn't exist
    if (!columnNames.includes('firebase_uid')) {
      console.log('📝 Adding firebase_uid column...');
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN firebase_uid VARCHAR(255) UNIQUE
      `);
      console.log('✅ firebase_uid column added');
    } else {
      console.log('⏭️  firebase_uid column already exists');
    }

    // Add firebase_email if it doesn't exist
    if (!columnNames.includes('firebase_email')) {
      console.log('📝 Adding firebase_email column...');
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN firebase_email VARCHAR(255)
      `);
      console.log('✅ firebase_email column added');
    } else {
      console.log('⏭️  firebase_email column already exists');
    }

    // Add auth_method if it doesn't exist
    if (!columnNames.includes('auth_method')) {
      console.log('📝 Adding auth_method column...');
      await connection.execute(`
        ALTER TABLE customers 
        ADD COLUMN auth_method ENUM('local', 'firebase') DEFAULT 'local'
      `);
      console.log('✅ auth_method column added');
    } else {
      console.log('⏭️  auth_method column already exists');
    }

    // Add index on firebase_uid if it doesn't exist
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'firebase_uid' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    if (indexes.length === 0) {
      console.log('📝 Adding index on firebase_uid...');
      await connection.execute(`
        ALTER TABLE customers 
        ADD INDEX idx_firebase_uid (firebase_uid)
      `);
      console.log('✅ Index on firebase_uid added');
    } else {
      console.log('⏭️  Index on firebase_uid already exists');
    }

    // Add image_url column to campaigns table if it doesn't exist
    const [campaignColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'campaigns' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    const campaignColumnNames = campaignColumns.map(col => col.COLUMN_NAME);

    if (!campaignColumnNames.includes('image_url')) {
      console.log('📝 Adding image_url column to campaigns table...');
      await connection.execute(`
        ALTER TABLE campaigns 
        ADD COLUMN image_url VARCHAR(500) AFTER description
      `);
      console.log('✅ image_url column added to campaigns table');
    } else {
      console.log('⏭️  image_url column already exists in campaigns table');
    }

    // Add use_end_date column to campaigns table if it doesn't exist
    if (!campaignColumnNames.includes('use_end_date')) {
      console.log('📝 Adding use_end_date column to campaigns table...');
      await connection.execute(`
        ALTER TABLE campaigns 
        ADD COLUMN use_end_date BOOLEAN DEFAULT TRUE AFTER end_at
      `);
      console.log('✅ use_end_date column added to campaigns table');
    } else {
      console.log('⏭️  use_end_date column already exists in campaigns table');
    }

    console.log('✅ ALTER migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate();
