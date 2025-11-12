const { promisePool } = require('../config/database');

class User {
  // Create new dashboard user with approval status
  static async create(userData) {
    const { 
      email, password, firstName, lastName, phone, role = 'user',
      profileData = {}, socialLinks = {}, preferences = {}, customFields = {}
    } = userData;
    
    const displayName = [firstName, lastName].filter(Boolean).join(' ');
    
    const [result] = await promisePool.query(
      `INSERT INTO dashboard_users (
        email, password, role, status,
        first_name, last_name, display_name, phone,
        profile_data, social_links, preferences, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, password, role, 'pending',
        firstName, lastName, displayName, phone,
        JSON.stringify(profileData),
        JSON.stringify(socialLinks),
        JSON.stringify(preferences),
        JSON.stringify(customFields)
      ]
    );
    
    return this.findById(result.insertId);
  }

  // Find user by ID with full profile
  static async findById(id) {
    const [rows] = await promisePool.query(`
      SELECT id, uuid, email, role, status, 
             first_name, last_name, display_name, avatar_url, phone,
             bio, website, location, company, job_title,
             profile_data, social_links, preferences, custom_fields,
             last_login_at, created_at, updated_at
      FROM dashboard_users 
      WHERE id = ? AND deleted_at IS NULL
    `, [id]);
    
    return this.parseJsonFields(rows[0]);
  }

  // Find user by email (for login)
  static async findByEmail(email) {
    const [rows] = await promisePool.query(`
      SELECT id, uuid, email, password, role, status,
             first_name, last_name, display_name, avatar_url, phone,
             bio, website, location, company, job_title,
             profile_data, social_links, preferences, custom_fields,
             last_login_at, login_attempts, locked_until, created_at
      FROM dashboard_users 
      WHERE email = ? AND deleted_at IS NULL
    `, [email]);
    
    return this.parseJsonFields(rows[0]);
  }

  // Helper method to parse JSON fields
  static parseJsonFields(user) {
    if (!user) return null;
    
    try {
      // Parse JSON fields
      user.profile_data = user.profile_data ? JSON.parse(user.profile_data) : {};
      user.social_links = user.social_links ? JSON.parse(user.social_links) : {};
      user.preferences = user.preferences ? JSON.parse(user.preferences) : {};
      user.custom_fields = user.custom_fields ? JSON.parse(user.custom_fields) : {};
      
      // Handle NULL/empty status - set default to 'pending'
      if (!user.status || user.status === '' || user.status === null) {
        user.status = 'pending';
      }
      
      // Map old status values to new ones
      const statusMapping = {
        'active': 'approved',
        'inactive': 'pending', 
        'suspended': 'hold',
        'banned': 'hold',
        'rejected': 'hold'
      };
      
      // Convert old status to new status if needed
      if (statusMapping[user.status]) {
        console.log(`🔄 Converting old status '${user.status}' to '${statusMapping[user.status]}' for user ${user.id}`);
        user.status = statusMapping[user.status];
      }
      
      // Ensure status is one of the valid values
      const validStatuses = ['approved', 'pending', 'hold'];
      if (!validStatuses.includes(user.status)) {
        console.log(`⚠️ Invalid status '${user.status}' for user ${user.id}, setting to 'pending'`);
        user.status = 'pending';
      }
      
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      // Set defaults if parsing fails
      user.profile_data = {};
      user.social_links = {};
      user.preferences = {};
      user.custom_fields = {};
      user.status = 'pending';
    }
    
    return user;
  }

  // Get all dashboard users with filtering
  static async findAll(filters = {}) {
    console.log('🔥 User.findAll called with filters:', filters);
    
    let query = `
      SELECT id, uuid, email, role, status,
             first_name, last_name, display_name, avatar_url, phone,
             bio, website, location, company, job_title,
             profile_data, social_links, preferences, custom_fields,
             last_login_at, created_at, updated_at
      FROM dashboard_users 
      WHERE deleted_at IS NULL
    `;
    
    const params = [];
    console.log('🔍 Base query:', query);

    // Filter by role
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    // Filter by status
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    // Search by name or email
    if (filters.search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR display_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Order and pagination
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    console.log('🔄 Executing findAll query:', query);
    console.log('🔄 With params:', params);
    
    const [rows] = await promisePool.query(query, params);
    
    console.log('📥 Raw database results:');
    rows.forEach((row, index) => {
      console.log(`📄 Raw User ${index + 1}:`, {
        id: row.id,
        email: row.email,
        rawStatus: row.status,
        role: row.role
      });
    });
    
    const processedUsers = rows.map(user => this.parseJsonFields(user));
    
    console.log('✅ Processed users:');
    processedUsers.forEach((user, index) => {
      console.log(`👤 Processed User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        processedStatus: user.status,
        role: user.role
      });
    });
    
    return processedUsers;
  }

  // Update user profile
  static async updateProfile(id, profileData) {
    const { 
      first_name, last_name, phone, location, bio, website, 
      company, job_title, social_links, custom_fields, profile_data 
    } = profileData;
    
    const display_name = [first_name, last_name].filter(Boolean).join(' ') || null;

    await promisePool.query(`
      UPDATE dashboard_users SET 
        first_name = ?, last_name = ?, display_name = ?,
        phone = ?, location = ?, bio = ?, website = ?,
        company = ?, job_title = ?,
        social_links = ?, custom_fields = ?, profile_data = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      first_name, last_name, display_name,
      phone, location, bio, website, company, job_title,
      JSON.stringify(social_links || {}),
      JSON.stringify(custom_fields || {}),
      JSON.stringify(profile_data || {}),
      id
    ]);

    return this.findById(id);
  }

  // Update user status/role (admin only)
  static async updateStatus(id, updates) {
    console.log('🔥 User.updateStatus called:', { id, updates });
    
    const allowedFields = ['role', 'status'];
    const updateFields = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      console.log('🔍 Processing field:', { key, value, allowed: allowedFields.includes(key) });
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    }

    console.log('📝 Update fields:', updateFields);
    console.log('📝 Params:', params);

    if (updateFields.length === 0) {
      console.log('❌ No valid fields to update');
      throw new Error('No valid fields to update');
    }

    params.push(id);
    
    const query = `UPDATE dashboard_users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`;
    console.log('🔄 Executing query:', query);
    console.log('🔄 With params:', params);
    
    const result = await promisePool.query(query, params);
    console.log('✅ Query result:', result);
    
    // Check if any rows were actually updated
    if (result[0].affectedRows === 0) {
      console.log('⚠️ No rows were updated - user might not exist or already deleted');
    }

    const updatedUser = await this.findById(id);
    console.log('👤 Updated user:', updatedUser ? 'FOUND' : 'NOT_FOUND');
    
    return updatedUser;
  }

  // Approve user (admin only)
  static async approve(id) {
    await promisePool.query(
      'UPDATE dashboard_users SET status = "approved" WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  // Put user on hold (admin only)
  static async suspend(id) {
    await promisePool.query(
      'UPDATE dashboard_users SET status = "hold" WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  // Update last login
  static async updateLastLogin(id, ipAddress = null) {
    await promisePool.query(
      'UPDATE dashboard_users SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = ? WHERE id = ?',
      [ipAddress, id]
    );
  }

  // Soft delete user
  static async delete(id) {
    const [result] = await promisePool.query(
      'UPDATE dashboard_users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get user statistics
  static async getStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
      FROM dashboard_users 
      WHERE deleted_at IS NULL
    `);
    return rows[0];
  }

  // Get users by role
  static async findByRole(role) {
    const [rows] = await promisePool.query(`
      SELECT id, email, first_name, last_name, display_name, role, status, created_at 
      FROM dashboard_users 
      WHERE role = ? AND status = 'active' AND deleted_at IS NULL
    `, [role]);
    return rows.map(user => this.parseJsonFields(user));
  }

  // Get pending users (for admin approval)
  static async getPendingUsers() {
    const [rows] = await promisePool.query(`
      SELECT id, email, first_name, last_name, display_name, role, created_at 
      FROM dashboard_users 
      WHERE status = 'pending' AND deleted_at IS NULL 
      ORDER BY created_at ASC
    `);
    return rows.map(user => this.parseJsonFields(user));
  }
}

module.exports = User;
