import pool from '../database/connection.js';

/**
 * Get all dynamic content (for admin panel)
 */
export async function listDynamicContent(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM dynamic_content ORDER BY priority DESC, created_at DESC`
    );

    res.json({ success: true, content: rows });
  } catch (error) {
    console.error('Error fetching dynamic content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get active content by key (for Flutter app)
 */
export async function getContentByKey(req, res) {
  try {
    const { key } = req.params;

    const [rows] = await pool.execute(
      `SELECT * FROM dynamic_content 
       WHERE key_name = ? AND status = 'active'
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())`,
      [key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, content: rows[0] });
  } catch (error) {
    console.error('Error fetching content by key:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get all active content by type (for Flutter app)
 */
export async function getActiveContentByType(req, res) {
  try {
    const { type } = req.params;

    const [rows] = await pool.execute(
      `SELECT * FROM dynamic_content 
       WHERE content_type = ? AND status = 'active'
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       ORDER BY priority DESC`,
      [type]
    );

    res.json({ success: true, content: rows });
  } catch (error) {
    console.error('Error fetching content by type:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get all active content (for Flutter app)
 */
export async function getAllActiveContent(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM dynamic_content 
       WHERE status = 'active'
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())
       ORDER BY priority DESC, content_type`
    );

    // Group by type for easier consumption
    const grouped = rows.reduce((acc, item) => {
      if (!acc[item.content_type]) {
        acc[item.content_type] = [];
      }
      acc[item.content_type].push(item);
      return acc;
    }, {});

    res.json({ success: true, content: grouped });
  } catch (error) {
    console.error('Error fetching active content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Create new dynamic content
 */
export async function createDynamicContent(req, res) {
  try {
    const {
      key_name,
      title,
      description,
      content_type = 'promo',
      status = 'active',
      priority = 0,
      start_date,
      end_date,
      metadata
    } = req.body;

    if (!key_name || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key name and title are required' 
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO dynamic_content 
       (key_name, title, description, content_type, status, priority, start_date, end_date, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        key_name,
        title,
        description || '',
        content_type,
        status,
        priority,
        start_date || null,
        end_date || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating dynamic content:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A content with this key already exists'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Update dynamic content
 */
export async function updateDynamicContent(req, res) {
  try {
    const { id } = req.params;
    const {
      key_name,
      title,
      description,
      content_type,
      status,
      priority,
      start_date,
      end_date,
      metadata
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE dynamic_content 
       SET key_name = ?, title = ?, description = ?, content_type = ?, 
           status = ?, priority = ?, start_date = ?, end_date = ?, metadata = ?
       WHERE id = ?`,
      [
        key_name,
        title,
        description || '',
        content_type,
        status,
        priority || 0,
        start_date || null,
        end_date || null,
        metadata ? JSON.stringify(metadata) : null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating dynamic content:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A content with this key already exists'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Delete dynamic content
 */
export async function deleteDynamicContent(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM dynamic_content WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting dynamic content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Toggle content status
 */
export async function toggleContentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [result] = await pool.execute(
      'UPDATE dynamic_content SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
