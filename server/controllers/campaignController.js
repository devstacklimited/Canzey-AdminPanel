import pool from '../database/connection.js';

/**
 * Create a new campaign (admin only)
 */
export async function createCampaign(campaignData) {
  try {
    console.log('📝 [CREATE CAMPAIGN] Request received');
    console.log('   📊 Campaign data:', campaignData);
    
    const { 
      title, 
      description, 
      image_url,
      ticket_price, 
      credits_per_ticket, 
      max_tickets_per_user, 
      status = 'active',
      start_at,
      end_at 
    } = campaignData;

    if (!title || ticket_price === undefined || credits_per_ticket === undefined) {
      return { success: false, error: 'Title, ticket_price, and credits_per_ticket are required' };
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      `INSERT INTO campaigns (title, description, image_url, ticket_price, credits_per_ticket, max_tickets_per_user, status, start_at, end_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || null, 
        description || null, 
        image_url || null, 
        ticket_price || null, 
        credits_per_ticket || null, 
        max_tickets_per_user || null, 
        status || null, 
        start_at || null, 
        end_at || null
      ]
    );
    
    connection.release();
    
    console.log('✅ [CREATE CAMPAIGN] Campaign created successfully');
    return { 
      success: true, 
      message: 'Campaign created successfully', 
      campaign: { 
        id: result.insertId, 
        title, 
        description, 
        image_url,
        ticket_price, 
        credits_per_ticket, 
        max_tickets_per_user,
        status,
        start_at,
        end_at
      } 
    };
  } catch (error) {
    console.error('❌ [CREATE CAMPAIGN] Error:', error.message);
    return { success: false, error: 'Server error during campaign creation' };
  }
}

/**
 * Get all campaigns (admin only)
 */
export async function listAllCampaigns() {
  try {
    console.log('📝 [LIST CAMPAIGNS] Request received');
    
    const connection = await pool.getConnection();
    const [campaigns] = await connection.execute(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    connection.release();
    
    console.log('✅ [LIST CAMPAIGNS] Found', campaigns.length, 'campaigns');
    return { success: true, campaigns };
  } catch (error) {
    console.error('❌ [LIST CAMPAIGNS] Error:', error.message);
    return { success: false, error: 'Server error while fetching campaigns' };
  }
}

/**
 * Get active campaigns (public - for Flutter app)
 */
export async function listActiveCampaigns() {
  try {
    console.log('📝 [LIST ACTIVE CAMPAIGNS] Request received');
    
    const connection = await pool.getConnection();
    const [campaigns] = await connection.execute(
      `SELECT id, title, description, image_url, ticket_price, credits_per_ticket, max_tickets_per_user, start_at, end_at, created_at 
       FROM campaigns 
       WHERE status = 'active' 
       AND (start_at IS NULL OR start_at <= NOW()) 
       AND (end_at IS NULL OR end_at >= NOW())
       ORDER BY created_at DESC`
    );
    connection.release();
    
    console.log('✅ [LIST ACTIVE CAMPAIGNS] Found', campaigns.length, 'active campaigns');
    return { success: true, campaigns };
  } catch (error) {
    console.error('❌ [LIST ACTIVE CAMPAIGNS] Error:', error.message);
    return { success: false, error: 'Server error while fetching active campaigns' };
  }
}

/**
 * Update campaign (admin only)
 */
export async function updateCampaign(campaignId, updateData) {
  try {
    console.log('📝 [UPDATE CAMPAIGN] Request received');
    console.log('   Campaign ID:', campaignId);
    console.log('   📊 Update data:', updateData);
    
    const { 
      title, 
      description, 
      image_url,
      ticket_price, 
      credits_per_ticket, 
      max_tickets_per_user, 
      status,
      start_at,
      end_at 
    } = updateData;

    const connection = await pool.getConnection();
    
    await connection.execute(
      `UPDATE campaigns 
       SET title = ?, description = ?, image_url = ?, ticket_price = ?, credits_per_ticket = ?, 
           max_tickets_per_user = ?, status = ?, start_at = ?, end_at = ?
       WHERE id = ?`,
      [
        title || null, 
        description || null, 
        image_url || null, 
        ticket_price || null, 
        credits_per_ticket || null, 
        max_tickets_per_user || null, 
        status || null, 
        start_at || null, 
        end_at || null, 
        campaignId
      ]
    );
    
    const [campaigns] = await connection.execute('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    connection.release();
    
    if (campaigns.length === 0) {
      return { success: false, error: 'Campaign not found' };
    }
    
    console.log('✅ [UPDATE CAMPAIGN] Campaign updated successfully');
    return { success: true, message: 'Campaign updated successfully', campaign: campaigns[0] };
  } catch (error) {
    console.error('❌ [UPDATE CAMPAIGN] Error:', error.message);
    return { success: false, error: 'Server error during campaign update' };
  }
}

/**
 * Delete campaign (admin only)
 */
export async function deleteCampaign(campaignId) {
  try {
    console.log('📝 [DELETE CAMPAIGN] Request received');
    console.log('   Campaign ID:', campaignId);
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM campaigns WHERE id = ?', [campaignId]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Campaign not found' };
    }
    
    console.log('✅ [DELETE CAMPAIGN] Campaign deleted successfully');
    return { success: true, message: 'Campaign deleted successfully' };
  } catch (error) {
    console.error('❌ [DELETE CAMPAIGN] Error:', error.message);
    return { success: false, error: 'Server error during campaign deletion' };
  }
}
