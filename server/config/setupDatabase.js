const { promisePool } = require('./database');
const bcrypt = require('bcryptjs');

// Setup database and create admin user
const setupDatabase = async () => {
  try {
    // 1. Create users table directly
    console.log('🔧 Creating users table...');
    
    // ============================================
    // SINGLE DASHBOARD USERS TABLE - Everything in one place
    // ============================================
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS dashboard_users (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
        
        -- Authentication
        email VARCHAR(320) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'staff', 'user') DEFAULT 'user',
        status ENUM('approved', 'pending', 'hold') DEFAULT 'pending',
        
        -- Basic Profile Info
        first_name VARCHAR(100) NULL,
        last_name VARCHAR(100) NULL,
        display_name VARCHAR(150) NULL,
        avatar_url VARCHAR(500) NULL,
        phone VARCHAR(20) NULL,
        email_verified_at TIMESTAMP NULL,
        
        -- Contact & Location
        location VARCHAR(255) NULL,
        bio TEXT NULL,
        website VARCHAR(500) NULL,
        
        -- Professional Info
        company VARCHAR(255) NULL,
        job_title VARCHAR(255) NULL,
        
        -- Flexible JSON Data - Store ANYTHING here for future
        profile_data JSON NULL,
        preferences JSON NULL,
        social_links JSON NULL,
        custom_fields JSON NULL,
        
        -- Security & Tracking
        last_login_at TIMESTAMP NULL,
        last_login_ip VARCHAR(45) NULL,
        login_attempts TINYINT UNSIGNED DEFAULT 0,
        locked_until TIMESTAMP NULL,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        
        -- Indexes for performance
        INDEX idx_email (email),
        INDEX idx_uuid (uuid),
        INDEX idx_status (status),
        INDEX idx_role (role),
        INDEX idx_display_name (display_name),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Users table created successfully');
    
    // 2. Create admin user
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
};

// Create dashboard admin user function
const createAdminUser = async () => {
  try {
    // Check if dashboard admin user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM dashboard_users WHERE email = ?',
      ['admin@canzey.com']
    );

    if (existingUsers.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Create comprehensive dashboard admin profile with flexible data
      const profileData = {
        dashboard_preferences: {
          theme: 'light',
          notifications: true,
          sidebar_collapsed: false,
          default_view: 'overview'
        },
        permissions: ['all'],
        created_by: 'system',
        user_type: 'dashboard_admin'
      };

      const socialLinks = {
        linkedin: null,
        twitter: null,
        github: null,
        website: null
      };

      const preferences = {
        language: 'en',
        timezone: 'UTC',
        email_notifications: true,
        push_notifications: true
      };

      // Insert dashboard admin user with all data in one table
      await promisePool.query(
        `INSERT INTO dashboard_users (
          email, password, role, status,
          first_name, last_name, display_name,
          phone, location, bio, website, company, job_title,
          profile_data, social_links, preferences, custom_fields
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin@canzey.com',
          hashedPassword,
          'admin',
          'active',
          'Dashboard',
          'Administrator', 
          'Dashboard Administrator',
          null, // phone
          null, // location  
          'Dashboard Administrator - Full system access',
          null, // website
          'Canzey Dashboard',
          'System Administrator',
          JSON.stringify(profileData),
          JSON.stringify(socialLinks),
          JSON.stringify(preferences),
          JSON.stringify({}) // empty custom fields for future use
        ]
      );

      console.log('🎛️  Dashboard Admin User Created:');
      console.log('   📧 Email: admin@canzey.com');
      console.log('   🔑 Password: 123456');
      console.log('   🎯 Role: admin');
      console.log('   ✅ Status: active');
      console.log('   📊 Type: Dashboard Administrator');
      console.log('   🔧 Single Table: All data in dashboard_users');
      console.log('   🚀 Flexible: JSON fields for unlimited expansion');
    } else {
      console.log('✅ Dashboard admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating dashboard admin user:', error.message);
  }

  };

module.exports = { setupDatabase, createAdminUser };
