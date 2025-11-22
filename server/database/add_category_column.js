import pool from '../database/connection.js';

/**
 * Add category column to products table
 */
async function addCategoryColumn() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'category'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Category column already exists in products table');
      return;
    }
    
    // Add category column
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN category VARCHAR(100) DEFAULT NULL
      AFTER stock_quantity
    `);
    
    console.log('✅ Added category column to products table');
    
  } catch (error) {
    console.error('❌ Error adding category column:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Run migration
addCategoryColumn()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
