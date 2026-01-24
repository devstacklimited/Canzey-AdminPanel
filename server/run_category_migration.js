import pool from './database/connection.js';

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('🏗️ Adding category columns...');
    
    // Add to campaigns
    try {
      await connection.execute(`
        ALTER TABLE campaigns 
        ADD COLUMN category ENUM('exclusive', 'cash', 'electronics', 'featured', 'new', 'premium') DEFAULT 'featured'
      `);
      console.log('✅ Added category to campaigns');
      
      await connection.execute('ALTER TABLE campaigns ADD INDEX idx_category (category)');
      console.log('✅ Added index to campaigns');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Campaign category column already exists');
      } else {
        throw err;
      }
    }
    
    // Add to product_prizes
    try {
      await connection.execute(`
        ALTER TABLE product_prizes 
        ADD COLUMN category ENUM('exclusive', 'cash', 'electronics', 'featured', 'new', 'premium') DEFAULT 'featured'
      `);
      console.log('✅ Added category to product_prizes');
      
      await connection.execute('ALTER TABLE product_prizes ADD INDEX idx_category (category)');
      console.log('✅ Added index to product_prizes');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Product prizes category column already exists');
      } else {
        throw err;
      }
    }
    
    // Update existing records
    await connection.execute('UPDATE campaigns SET category = "featured" WHERE category IS NULL');
    await connection.execute('UPDATE product_prizes SET category = "featured" WHERE category IS NULL');
    console.log('✅ Updated existing records');
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
