import pool from './connection.js';

/**
 * Create product_prizes table for product-prize-ticket mapping
 */
async function createProductPrizesTable() {
  try {
    console.log('🏗️ [PRODUCT PRIZES] Creating product_prizes table...');
    
    const connection = await pool.getConnection();
    
    // Drop table if exists (for development)
    await connection.execute('DROP TABLE IF EXISTS product_prizes');
    
    // Create product_prizes table
    await connection.execute(`
      CREATE TABLE product_prizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        campaign_id INT NOT NULL,
        tickets_required INT NOT NULL DEFAULT 1,
        tickets_sold INT DEFAULT 0,
        tickets_remaining INT GENERATED ALWAYS AS (tickets_required - tickets_sold) STORED,
        countdown_start_tickets INT DEFAULT 0,
        category ENUM('exclusive', 'cash', 'electronics', 'featured', 'new', 'premium') DEFAULT 'featured',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        
        INDEX idx_product_campaign (product_id, campaign_id),
        INDEX idx_campaign (campaign_id),
        INDEX idx_tickets_remaining (tickets_remaining),
        INDEX idx_active (is_active),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    
    console.log('✅ [PRODUCT PRIZES] Table created successfully');
    return true;
  } catch (error) {
    console.error('❌ [PRODUCT PRIZES] Error creating table:', error);
    return false;
  }
}

/**
 * Insert sample product-prize mappings
 */
async function insertSampleProductPrizes() {
  try {
    console.log('📝 [PRODUCT PRIZES] Inserting sample data...');
    
    const connection = await pool.getConnection();
    
    // Get existing products and campaigns
    const [products] = await connection.execute('SELECT id, name FROM products LIMIT 5');
    const [campaigns] = await connection.execute('SELECT id, title FROM campaigns LIMIT 3');
    
    if (products.length === 0 || campaigns.length === 0) {
      console.log('ℹ️ [PRODUCT PRIZES] No products or campaigns found, skipping sample data');
      connection.release();
      return true;
    }
    
    // Define available categories
    const categories = ['exclusive', 'cash', 'electronics', 'featured', 'new', 'premium'];
    
    // Create sample mappings
    for (let i = 0; i < Math.min(products.length, campaigns.length); i++) {
      const product = products[i];
      const campaign = campaigns[i];
      const ticketsRequired = Math.floor(Math.random() * 900) + 100; // 100-1000 tickets
      const category = categories[i % categories.length]; // Rotate through categories
      
      await connection.execute(`
        INSERT INTO product_prizes (product_id, campaign_id, tickets_required, countdown_start_tickets, category)
        VALUES (?, ?, ?, ?, ?)
      `, [
        product.id,
        campaign.id,
        ticketsRequired,
        Math.floor(ticketsRequired * 0.1), // Start countdown at 10% sold
        category
      ]);
      
      console.log(`   🎁 ${product.name} → ${campaign.title} (${ticketsRequired} tickets) [${category}]`);
    }
    
    connection.release();
    
    console.log('✅ [PRODUCT PRIZES] Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ [PRODUCT PRIZES] Error inserting sample data:', error);
    return false;
  }
}

/**
 * Run the migration
 */
async function runMigration() {
  try {
    const tableCreated = await createProductPrizesTable();
    if (tableCreated) {
      await insertSampleProductPrizes();
      console.log('🎉 [PRODUCT PRIZES] Migration completed successfully');
    } else {
      console.log('❌ [PRODUCT PRIZES] Migration failed');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ [PRODUCT PRIZES] Migration error:', error);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { createProductPrizesTable, insertSampleProductPrizes };
