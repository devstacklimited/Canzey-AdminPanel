import pool from './connection.js';

/**
 * Create banners table
 */
async function createBannersTable() {
  try {
    console.log('🏗️ [BANNERS] Creating banners table...');
    
    const connection = await pool.getConnection();
    
    // Drop table if exists (for development)
    await connection.execute('DROP TABLE IF EXISTS banners');
    
    // Create banners table
    await connection.execute(`
      CREATE TABLE banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        width INT DEFAULT 1080,
        height INT DEFAULT 400,
        priority INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        link_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_priority (priority),
        INDEX idx_active (is_active),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    
    console.log('✅ [BANNERS] Banners table created successfully');
    return true;
  } catch (error) {
    console.error('❌ [BANNERS] Error creating banners table:', error);
    return false;
  }
}

/**
 * Insert sample banners
 */
async function insertSampleBanners() {
  try {
    console.log('📝 [BANNERS] Inserting sample banners...');
    
    const connection = await pool.getConnection();
    
    const sampleBanners = [
      {
        title: 'Big Sale',
        image_url: '/uploads/banners/sample-big-sale.jpg',
        width: 1080,
        height: 400,
        priority: 10,
        is_active: true,
        link_url: '/sale'
      },
      {
        title: 'New Arrivals',
        image_url: '/uploads/banners/sample-new-arrivals.jpg',
        width: 1080,
        height: 400,
        priority: 5,
        is_active: true,
        link_url: '/new'
      },
      {
        title: 'Limited Offer',
        image_url: '/uploads/banners/sample-limited-offer.jpg',
        width: 1080,
        height: 400,
        priority: 3,
        is_active: false,
        link_url: '/limited'
      }
    ];
    
    for (const banner of sampleBanners) {
      await connection.execute(`
        INSERT INTO banners (title, image_url, width, height, priority, is_active, link_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        banner.title,
        banner.image_url,
        banner.width,
        banner.height,
        banner.priority,
        banner.is_active ? 1 : 0,
        banner.link_url
      ]);
    }
    
    connection.release();
    
    console.log('✅ [BANNERS] Sample banners inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ [BANNERS] Error inserting sample banners:', error);
    return false;
  }
}

/**
 * Run the migration
 */
async function runMigration() {
  try {
    const tableCreated = await createBannersTable();
    if (tableCreated) {
      await insertSampleBanners();
      console.log('🎉 [BANNERS] Migration completed successfully');
    } else {
      console.log('❌ [BANNERS] Migration failed');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ [BANNERS] Migration error:', error);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { createBannersTable, insertSampleBanners };
