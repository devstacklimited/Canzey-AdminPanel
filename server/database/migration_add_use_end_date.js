import pool from './connection.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('🚀 Starting migration: Add use_end_date to campaigns...');
    
    // Check if column exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM campaigns LIKE "use_end_date"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE campaigns 
        ADD COLUMN use_end_date BOOLEAN DEFAULT TRUE AFTER end_at
      `);
      console.log('✅ Added use_end_date column to campaigns table');
    } else {
      console.log('ℹ️  Column use_end_date already exists, skipping ADD COLUMN');
    }

    console.log('✨ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrate();
