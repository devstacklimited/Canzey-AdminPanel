const db = require('../config/database');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const [result] = await db.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};
