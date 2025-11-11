const { promisePool } = require('../config/database');

class User {
  // Create new user with approval status
  static async create(userData) {
    const { email, password, name, role = 'staff' } = userData;
    
    const [result] = await promisePool.query(
      `INSERT INTO users (email, password, name, role, status, is_active) 
       VALUES (?, ?, ?, ?, 'pending', 1)`,
      [email, password, name, role]
    );
    
    return this.findById(result.insertId);
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await promisePool.query(
      'SELECT id, email, name, role, status, is_active, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Find user by email (for login)
  static async findByEmail(email) {
    const [rows] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Get all users with filtering
  static async findAll(filters = {}) {
    let query = `
      SELECT id, email, name, role, status, is_active, 
             last_login, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

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

    // Filter by active status
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    // Search by name or email
    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
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

    const [rows] = await promisePool.query(query, params);
    return rows;
  }

  // Update user
  static async update(id, userData) {
    const allowedFields = ['name', 'role', 'status', 'is_active'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(userData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(id);
    
    await promisePool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // Approve user (admin only)
  static async approve(id) {
    await promisePool.query(
      'UPDATE users SET status = "approved" WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  // Reject user (admin only)
  static async reject(id) {
    await promisePool.query(
      'UPDATE users SET status = "rejected", is_active = 0 WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  // Activate/Deactivate user
  static async toggleActive(id, isActive) {
    await promisePool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, id]
    );
    return this.findById(id);
  }

  // Update last login
  static async updateLastLogin(id) {
    await promisePool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  // Delete user
  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get user stats
  static async getStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_count,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users
      FROM users
    `);
    return rows[0];
  }

  // Get users by role
  static async findByRole(role) {
    const [rows] = await promisePool.query(
      'SELECT id, email, name, role, status, is_active, created_at FROM users WHERE role = ? AND is_active = 1',
      [role]
    );
    return rows;
  }

  // Get pending users (for admin approval)
  static async getPendingUsers() {
    const [rows] = await promisePool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE status = "pending" ORDER BY created_at ASC'
    );
    return rows;
  }
}

module.exports = User;
