const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('🔥 getAllUsers controller called');
    const { role, status, search, limit, offset } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    console.log('🔍 Filters applied:', filters);

    const users = await User.findAll(filters);
    
    console.log('👥 Found users count:', users.length);
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        name: user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' '),
        role: user.role,
        status: user.status,
        rawStatus: user.status // Show what we're actually returning
      });
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
    
    console.log('✅ getAllUsers response sent');
  } catch (error) {
    console.error('💥 Error fetching users:', error);
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
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
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

// Update user status/role (admin only)
exports.updateUser = async (req, res) => {
  try {
    console.log('🔥 updateUser controller called');
    console.log('📋 Request params:', req.params);
    console.log('📋 Request body:', req.body);
    console.log('👤 Request user:', req.user ? { id: req.user.id, role: req.user.role } : 'NO_USER');
    
    const { id } = req.params;
    const { role, status } = req.body;
    
    console.log('🔍 Extracted data:', { userId: id, role, status });
    
    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    
    console.log('📝 Updates to apply:', updates);
    
    if (Object.keys(updates).length === 0) {
      console.log('⚠️ No valid updates provided');
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }
    
    console.log('🔄 Calling User.updateStatus...');
    const updatedUser = await User.updateStatus(id, updates);
    console.log('✅ User.updateStatus completed:', updatedUser ? 'SUCCESS' : 'FAILED');
    
    if (!updatedUser) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('🎉 Sending success response');
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('💥 Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Approve user (set status to approved)
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.updateStatus(id, { status: 'approved' });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User approved successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving user',
      error: error.message
    });
  }
};

// Put user on hold
exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.updateStatus(id, { status: 'hold' });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User put on hold successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error putting user on hold:', error);
    res.status(500).json({
      success: false,
      message: 'Error putting user on hold',
      error: error.message
    });
  }
};

// Set user to pending status
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.updateStatus(id, { status: 'pending' });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User set to pending successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error setting user to pending:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting user to pending',
      error: error.message
    });
  }
};

// Soft delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.delete(id);
    
    if (!deleted) {
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
