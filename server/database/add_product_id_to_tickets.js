import pool from './connection.js';

/**
 * Add product_id column to campaign_tickets table
 * This is needed for product-level winner management
 */
async function addProductIdToTickets() {
  try {
    console.log('🔧 Adding product_id to campaign_tickets table...');
    
    const connection = await pool.getConnection();
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'campaign_tickets' 
      AND COLUMN_NAME = 'product_id'
    `);
    
    if (columns.length === 0) {
      // Add product_id column
      await connection.execute(`
        ALTER TABLE campaign_tickets 
        ADD COLUMN product_id INT AFTER campaign_id
      `);
      console.log('✅ Added product_id column to campaign_tickets');
      
      // Add foreign key constraint
      await connection.execute(`
        ALTER TABLE campaign_tickets 
        ADD CONSTRAINT fk_ticket_product 
        FOREIGN KEY (product_id) REFERENCES products(id)
      `);
      console.log('✅ Added foreign key constraint for product_id');
      
      // Add index for better performance
      await connection.execute(`
        CREATE INDEX idx_campaign_tickets_product_id 
        ON campaign_tickets(product_id)
      `);
      console.log('✅ Added index for product_id');
      
    } else {
      console.log('ℹ️ product_id column already exists');
    }
    
    connection.release();
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

/**
 * Migrate existing tickets to have product_id based on order data
 */
async function migrateExistingTickets() {
  try {
    console.log('🔄 Migrating existing tickets...');
    
    const connection = await pool.getConnection();
    
    // Find tickets without product_id
    const [tickets] = await connection.execute(`
      SELECT ct.id, ct.order_id, oi.product_id
      FROM campaign_tickets ct
      JOIN orders o ON ct.order_id = o.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE ct.product_id IS NULL
      LIMIT 1000
    `);
    
    console.log(`Found ${tickets.length} tickets to migrate`);
    
    for (const ticket of tickets) {
      await connection.execute(`
        UPDATE campaign_tickets 
        SET product_id = ? 
        WHERE id = ?
      `, [ticket.product_id, ticket.id]);
    }
    
    connection.release();
    console.log(`✅ Migrated ${tickets.length} tickets successfully!`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run migrations
async function runMigrations() {
  try {
    await addProductIdToTickets();
    await migrateExistingTickets();
    console.log('🎉 All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { addProductIdToTickets, migrateExistingTickets };
