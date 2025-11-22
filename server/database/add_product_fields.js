import pool from '../database/connection.js';

/**
 * Add sub_category, for_gender, and is_customized columns to products table
 */
async function addProductFields() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Add sub_category column
    const [subCatColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'sub_category'
    `);
    
    if (subCatColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN sub_category VARCHAR(100) DEFAULT NULL
        AFTER category
      `);
      console.log('✅ Added sub_category column');
    } else {
      console.log('✅ sub_category column already exists');
    }
    
    // Add for_gender column
    const [genderColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'for_gender'
    `);
    
    if (genderColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN for_gender VARCHAR(20) DEFAULT NULL
        AFTER sub_category
      `);
      console.log('✅ Added for_gender column');
    } else {
      console.log('✅ for_gender column already exists');
    }
    
    // Add is_customized column
    const [customColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'is_customized'
    `);
    
    if (customColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN is_customized BOOLEAN DEFAULT FALSE
        AFTER for_gender
      `);
      console.log('✅ Added is_customized column');
    } else {
      console.log('✅ is_customized column already exists');
    }
    
    console.log('✅ All product fields ready');
    
  } catch (error) {
    console.error('❌ Error adding product fields:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Run migration
addProductFields()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
