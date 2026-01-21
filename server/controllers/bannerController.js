import pool from '../database/connection.js';

/**
 * Create a new banner (admin only)
 */
export async function createBanner(bannerData) {
  try {
    console.log('📝 [CREATE BANNER] Request received');
    console.log('   🎨 Banner data:', bannerData);
    
    const { 
      title, 
      image_url,
      width,
      height,
      priority = 0,
      is_active = true,
      link_url
    } = bannerData;

    if (!title || !image_url) {
      return { success: false, error: 'Title and image are required' };
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      `INSERT INTO banners (title, image_url, width, height, priority, is_active, link_url, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title || null, 
        image_url || null, 
        width || 1080, 
        height || 400, 
        priority || 0, 
        is_active ? 1 : 0, 
        link_url || null
      ]
    );
    
    connection.release();
    const bannerId = result.insertId;

    console.log('✅ [CREATE BANNER] Banner created successfully:', bannerId);
    
    return { 
      success: true, 
      message: 'Banner created successfully',
      banner: {
        id: bannerId,
        title,
        image_url,
        width,
        height,
        priority,
        is_active,
        link_url
      }
    };
  } catch (error) {
    console.error('❌ [CREATE BANNER] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all banners (admin only)
 */
export async function listAllBanners() {
  try {
    console.log('📋 [LIST BANNERS] Request received');
    
    const connection = await pool.getConnection();
    
    const [banners] = await connection.execute(
      `SELECT id, title, image_url, width, height, priority, is_active, link_url, created_at, updated_at 
       FROM banners 
       ORDER BY priority DESC, created_at DESC`
    );
    
    connection.release();
    
    // Convert is_active from 0/1 to boolean
    const formattedBanners = banners.map(banner => ({
      ...banner,
      is_active: Boolean(banner.is_active)
    }));

    console.log('✅ [LIST BANNERS] Retrieved banners:', formattedBanners.length);
    
    return { 
      success: true, 
      banners: formattedBanners
    };
  } catch (error) {
    console.error('❌ [LIST BANNERS] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update banner (admin only)
 */
export async function updateBanner(bannerId, updateData) {
  try {
    console.log('📝 [UPDATE BANNER] Request received');
    console.log('   🆔 Banner ID:', bannerId);
    console.log('   📊 Update data:', updateData);
    
    const { 
      title, 
      image_url,
      width,
      height,
      priority,
      is_active,
      link_url
    } = updateData;

    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      `UPDATE banners 
       SET title = ?, image_url = ?, width = ?, height = ?, priority = ?, is_active = ?, link_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title || null, 
        image_url || null, 
        width || 1080, 
        height || 400, 
        priority || 0, 
        is_active ? 1 : 0, 
        link_url || null,
        bannerId
      ]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Banner not found' };
    }

    console.log('✅ [UPDATE BANNER] Banner updated successfully:', bannerId);
    
    return { 
      success: true, 
      message: 'Banner updated successfully',
      banner: {
        id: bannerId,
        title,
        image_url,
        width,
        height,
        priority,
        is_active,
        link_url
      }
    };
  } catch (error) {
    console.error('❌ [UPDATE BANNER] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete banner (admin only)
 */
export async function deleteBanner(bannerId) {
  try {
    console.log('🗑️ [DELETE BANNER] Request received');
    console.log('   🆔 Banner ID:', bannerId);
    
    const connection = await pool.getConnection();
    
    // First get the banner info to delete the image file
    const [banner] = await connection.execute(
      'SELECT image_url FROM banners WHERE id = ?',
      [bannerId]
    );
    
    if (banner.length === 0) {
      connection.release();
      return { success: false, error: 'Banner not found' };
    }
    
    // Delete the banner record
    const [result] = await connection.execute(
      'DELETE FROM banners WHERE id = ?',
      [bannerId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Banner not found' };
    }

    console.log('✅ [DELETE BANNER] Banner deleted successfully:', bannerId);
    
    return { 
      success: true, 
      message: 'Banner deleted successfully'
    };
  } catch (error) {
    console.error('❌ [DELETE BANNER] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle banner active status (admin only)
 */
export async function toggleBannerStatus(bannerId, is_active) {
  try {
    console.log('🔄 [TOGGLE BANNER] Request received');
    console.log('   🆔 Banner ID:', bannerId);
    console.log('   📊 New status:', is_active);
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'UPDATE banners SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active ? 1 : 0, bannerId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Banner not found' };
    }

    console.log('✅ [TOGGLE BANNER] Banner status updated:', bannerId);
    
    return { 
      success: true, 
      message: 'Banner status updated successfully',
      is_active
    };
  } catch (error) {
    console.error('❌ [TOGGLE BANNER] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get active banners for public API (mobile app)
 */
export async function getActiveBanners() {
  try {
    console.log('📱 [PUBLIC BANNERS] Request received');
    
    const connection = await pool.getConnection();
    
    const [banners] = await connection.execute(
      `SELECT id, title, image_url, width, height, priority, link_url 
       FROM banners 
       WHERE is_active = 1 
       ORDER BY priority DESC, created_at DESC`
    );
    
    connection.release();
    
    console.log('✅ [PUBLIC BANNERS] Retrieved active banners:', banners.length);
    
    return { 
      success: true, 
      banners: banners
    };
  } catch (error) {
    console.error('❌ [PUBLIC BANNERS] Error:', error);
    return { success: false, error: error.message };
  }
}
