import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'canzey_dashboard_secret_key_2024_change_this_in_production';

/**
 * Admin sign in
 */
export async function adminSignIn(email, password) {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute('SELECT * FROM admin_users WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) return { success: false, error: 'Invalid email or password' };
    const user = users[0];
    if (user.status !== 'active') return { success: false, error: 'Account is not active' };

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return { success: false, error: 'Invalid email or password' };

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    const updateConnection = await pool.getConnection();
    await updateConnection.execute('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    updateConnection.release();

    return { success: true, token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, role: user.role, profile_url: user.profile_url, status: user.status } };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Server error during sign in' };
  }
}

/**
 * Admin sign up (admin only)
 */
export async function adminSignUp(userData, requesterRole) {
  try {
    if (requesterRole !== 'super_admin' && requesterRole !== 'admin') {
      return { success: false, error: 'Only admins can create new users' };
    }

    const { first_name, last_name, email, phone_number, password, role } = userData;
    if (!first_name || !last_name || !email || !password) {
      return { success: false, error: 'First name, last name, email, and password are required' };
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute('SELECT id FROM admin_users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      connection.release();
      return { success: false, error: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute('INSERT INTO admin_users (first_name, last_name, email, phone_number, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, email, phone_number || null, hashedPassword, role || 'staff', 'active']);
    connection.release();

    return { success: true, message: 'User created successfully', user: { id: result.insertId, first_name, last_name, email, phone_number, role: role || 'staff', status: 'active' } };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Server error during sign up' };
  }
}

/**
 * Get admin by token
 */
export async function getAdminByToken(userId) {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute('SELECT id, first_name, last_name, email, phone_number, role, profile_url, status FROM admin_users WHERE id = ?', [userId]);
    connection.release();
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Get admin error:', error);
    return null;
  }
}

/**
 * List all customers (for admin panel)
 */
export async function listAllCustomers() {
  try {
    const connection = await pool.getConnection();
    const [customers] = await connection.execute(
      'SELECT id, first_name, last_name, email, phone_number, profile_url, status, firebase_uid, created_at, updated_at FROM customers ORDER BY id ASC'
    );
    connection.release();
    return { success: true, customers };
  } catch (error) {
    console.error('List customers error:', error);
    return { success: false, error: 'Server error while fetching customers' };
  }
}

/**
 * Update admin info
 */
export async function updateAdminInfo(userId, updateData) {
  try {
    console.log('📝 [UPDATE ADMIN] Request received');
    console.log('   👤 User ID:', userId);
    console.log('   📊 Update data:', updateData);
    
    const { first_name, last_name, phone_number, profile_url } = updateData;
    const connection = await pool.getConnection();
    
    console.log('🔄 [UPDATE ADMIN] Executing UPDATE query...');
    console.log('   Values:', [first_name || null, last_name || null, phone_number || null, profile_url || null, userId]);
    
    await connection.execute(
      'UPDATE admin_users SET first_name = ?, last_name = ?, phone_number = ?, profile_url = ? WHERE id = ?',
      [first_name || null, last_name || null, phone_number || null, profile_url || null, userId]
    );
    
    console.log('✅ [UPDATE ADMIN] UPDATE query successful');
    
    const [users] = await connection.execute('SELECT id, first_name, last_name, email, phone_number, role, profile_url, status FROM admin_users WHERE id = ?', [userId]);
    connection.release();
    
    console.log('✅ [UPDATE ADMIN] Profile updated successfully');
    console.log('   Updated user:', users[0]);
    
    return { success: true, message: 'Profile updated successfully', user: users[0] };
  } catch (error) {
    console.error('❌ [UPDATE ADMIN] Error:', error.message);
    console.error('   Stack:', error.stack);
    return { success: false, error: 'Server error during update' };
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
