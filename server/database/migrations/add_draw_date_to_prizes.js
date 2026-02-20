import pool from '../connection.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Starting migration: Add draw_date to product_prizes...');
    
    // Check if column exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM product_prizes LIKE "draw_date"');
    
    if (columns.length === 0) {
      await connection.execute('ALTER TABLE product_prizes ADD COLUMN draw_date DATETIME DEFAULT NULL AFTER countdown_start_tickets');
      console.log('✅ Added draw_date column to product_prizes table');
    } else {
      console.log('ℹ️  draw_date column already exists in product_prizes table');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
