import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'canzey_dashboard_secret_key_2024_change_this_in_production';

/**
 * Customer sign in
 */
export async function customerSignIn(email, password) {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute('SELECT * FROM customers WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) return { success: false, error: 'Invalid email or password' };
    const user = users[0];
    if (user.status !== 'active') return { success: false, error: 'Account is not active' };

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return { success: false, error: 'Invalid email or password' };

    const token = jwt.sign({ userId: user.id, email: user.email, userType: 'customer' }, JWT_SECRET, { expiresIn: '24h' });

    return { success: true, token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, phone_number: user.phone_number, profile_url: user.profile_url, date_of_birth: user.date_of_birth, gender: user.gender, status: user.status } };
  } catch (error) {
    console.error('Customer sign in error:', error);
    return { success: false, error: 'Server error during sign in' };
  }
}

/**
 * Customer sign up
 */
export async function customerSignUp(userData) {
  try {
    const { first_name, last_name, email, phone_number, password, date_of_birth, gender } = userData;
    if (!first_name || !last_name || !email || !password) {
      return { success: false, error: 'First name, last name, email, and password are required' };
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute('SELECT id FROM customers WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      connection.release();
      return { success: false, error: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute('INSERT INTO customers (first_name, last_name, email, phone_number, date_of_birth, gender, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, email, phone_number || null, date_of_birth || null, gender || null, hashedPassword, 'active']);
    connection.release();

    return { success: true, message: 'Account created successfully', user: { id: result.insertId, first_name, last_name, email, phone_number, date_of_birth, gender, status: 'active' } };
  } catch (error) {
    console.error('Customer sign up error:', error);
    return { success: false, error: 'Server error during sign up' };
  }
}

/**
 * Get customer by token
 */
export async function getCustomerByToken(userId) {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute('SELECT id, first_name, last_name, email, phone_number, profile_url, date_of_birth, gender, status FROM customers WHERE id = ?', [userId]);
    connection.release();
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Get customer error:', error);
    return null;
  }
}

/**
 * Update customer info
 */
export async function updateCustomerInfo(userId, updateData) {
  try {
    console.log('📝 [UPDATE CUSTOMER] Request received');
    console.log('   👤 User ID:', userId);
    console.log('   📊 Update data:', updateData);
    
    const { first_name, last_name, phone_number, profile_url, date_of_birth, gender } = updateData;
    const connection = await pool.getConnection();
    
    console.log('🔄 [UPDATE CUSTOMER] Executing UPDATE query...');
    console.log('   Values:', [first_name || null, last_name || null, phone_number || null, profile_url || null, userId]);
    
    await connection.execute(
      'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ?, profile_url = ?, date_of_birth = ?, gender = ? WHERE id = ?',
      [first_name || null, last_name || null, phone_number || null, profile_url || null, date_of_birth || null, gender || null, userId]
    );
    
    console.log('✅ [UPDATE CUSTOMER] UPDATE query successful');
    
    const [users] = await connection.execute('SELECT id, first_name, last_name, email, phone_number, profile_url, date_of_birth, gender, status FROM customers WHERE id = ?', [userId]);
    connection.release();
    
    console.log('✅ [UPDATE CUSTOMER] Profile updated successfully');
    console.log('   Updated user:', users[0]);
    
    return { success: true, message: 'Profile updated successfully', user: users[0] };
  } catch (error) {
    console.error('❌ [UPDATE CUSTOMER] Error:', error.message);
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
