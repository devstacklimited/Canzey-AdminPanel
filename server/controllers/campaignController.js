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
      category,
      image_url,
      image_urls = [],
      ticket_price, 
      credits_per_ticket, 
      max_tickets_per_user, 
      status = 'active',
      start_at,
      end_at,
      use_end_date = true
    } = campaignData;

    if (!title) {
      return { success: false, error: 'Title is required' };
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      `INSERT INTO campaigns (title, description, category, image_url, ticket_price, credits_per_ticket, max_tickets_per_user, status, start_at, end_at, use_end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || null, 
        description || null, 
        (category && category !== 'undefined') ? category : 'featured',
        image_url || null, 
        ticket_price || 0, 
        credits_per_ticket || 0, 
        max_tickets_per_user || null, 
        status || 'active', 
        start_at || null, 
        end_at || null,
        use_end_date === 'false' ? 0 : 1
      ]
    );
    
    const campaignId = result.insertId;

    // Insert campaign images
    if (image_urls && image_urls.length > 0) {
      for (let i = 0; i < image_urls.length; i++) {
        await connection.execute(
          `INSERT INTO campaign_images (campaign_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
          [campaignId, image_urls[i], i === 0, i]
        );
      }
    }
    
    connection.release();
    
    console.log('✅ [CREATE CAMPAIGN] Campaign created successfully');
    return { 
      success: true, 
      message: 'Campaign created successfully', 
      campaign: { 
        id: campaignId, 
        title, 
        description, 
        image_url,
        images: image_urls,
        ticket_price, 
        credits_per_ticket, 
        max_tickets_per_user,
        status,
        start_at,
        end_at,
        use_end_date
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
export async function listAllCampaignsAdmin() {
  try {
    console.log('📝 [LIST CAMPAIGNS] Request received');
    
    const connection = await pool.getConnection();
    const [campaigns] = await connection.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM product_prizes pp WHERE pp.campaign_id = c.id AND pp.tickets_remaining > 0 AND pp.is_active = 1) as active_prizes_count
       FROM campaigns c
       ORDER BY c.created_at DESC`
    );

    // Fetch linked products for each campaign
    const [products] = await connection.execute(
      `SELECT id, name, main_image_url, price, campaign_id 
       FROM products 
       WHERE campaign_id IS NOT NULL AND status = 'active'`
    );

    // Fetch campaign images
    const [campaignImages] = await connection.execute(
      `SELECT campaign_id, id, image_url, is_primary, sort_order
       FROM campaign_images
       ORDER BY campaign_id, sort_order ASC`
    );
    connection.release();

    // Group products by campaign_id
    const productsByCampaign = {};
    for (const product of products) {
      if (!productsByCampaign[product.campaign_id]) {
        productsByCampaign[product.campaign_id] = [];
      }
      productsByCampaign[product.campaign_id].push({
        id: product.id,
        name: product.name,
        main_image_url: product.main_image_url,
        price: product.price
      });
    }

    // Group images by campaign_id
    const imagesByCampaign = {};
    for (const img of campaignImages) {
      if (!imagesByCampaign[img.campaign_id]) {
        imagesByCampaign[img.campaign_id] = [];
      }
      imagesByCampaign[img.campaign_id].push({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order
      });
    }

    // Attach products and images to each campaign
    const campaignsWithProducts = campaigns.map(campaign => ({
      ...campaign,
      products: productsByCampaign[campaign.id] || [],
      images: imagesByCampaign[campaign.id] || []
    }));
    
    console.log('✅ [LIST CAMPAIGNS] Found', campaigns.length, 'campaigns');
    return { success: true, campaigns: campaignsWithProducts };
  } catch (error) {
    console.error('❌ [LIST CAMPAIGNS] Error:', error.message);
    return { success: false, error: 'Server error while fetching campaigns' };
  }
}

/**
 * Get all campaigns (including closed ones - for Flutter app)
 */
export async function listAllCampaigns() {
  try {
    console.log('📝 [LIST ALL CAMPAIGNS] Request received');
    
    const connection = await pool.getConnection();
    const [campaigns] = await connection.execute(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM product_prizes pp WHERE pp.campaign_id = c.id AND pp.tickets_remaining > 0 AND pp.is_active = 1) as active_prizes_count
       FROM campaigns c
       ORDER BY c.created_at DESC`
    );

    // Fetch linked products for all campaigns
    const campaignIds = campaigns.map(c => c.id);
    let productsByCampaign = {};
    
    if (campaignIds.length > 0) {
      const [products] = await connection.execute(
        `SELECT id, name, main_image_url, price, campaign_id 
         FROM products 
         WHERE campaign_id IN (${campaignIds.join(',')})`
      );
      
      for (const product of products) {
        if (!productsByCampaign[product.campaign_id]) {
          productsByCampaign[product.campaign_id] = [];
        }
        productsByCampaign[product.campaign_id].push({
          id: product.id,
          name: product.name,
          main_image_url: product.main_image_url,
          price: product.price
        });
      }
    }
    connection.release();

    // Attach products to each campaign
    const campaignsWithProducts = campaigns.map(campaign => ({
      ...campaign,
      products: productsByCampaign[campaign.id] || []
    }));
    
    console.log('✅ [LIST ALL CAMPAIGNS] Found', campaigns.length, 'campaigns (including closed)');
    return { success: true, campaigns: campaignsWithProducts };
  } catch (error) {
    console.error('❌ [LIST ALL CAMPAIGNS] Error:', error.message);
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
      `SELECT c.*, 
        (SELECT COUNT(*) FROM product_prizes pp WHERE pp.campaign_id = c.id AND pp.tickets_remaining > 0 AND pp.is_active = 1) as active_prizes_count
       FROM campaigns c
       WHERE c.status = 'active' 
       AND (c.start_at IS NULL OR c.start_at <= NOW()) 
       AND (c.use_end_date = 0 OR c.end_at IS NULL OR c.end_at >= NOW())
       HAVING active_prizes_count > 0
       ORDER BY c.created_at DESC`
    );

    // Fetch linked products for active campaigns
    const campaignIds = campaigns.map(c => c.id);
    let productsByCampaign = {};
    
    if (campaignIds.length > 0) {
      const [products] = await connection.execute(
        `SELECT id, name, main_image_url, price, campaign_id 
         FROM products 
         WHERE campaign_id IN (${campaignIds.join(',')}) AND status = 'active'`
      );
      
      for (const product of products) {
        if (!productsByCampaign[product.campaign_id]) {
          productsByCampaign[product.campaign_id] = [];
        }
        productsByCampaign[product.campaign_id].push({
          id: product.id,
          name: product.name,
          main_image_url: product.main_image_url,
          price: product.price
        });
      }
    }
    connection.release();

    // Attach products to each campaign
    const campaignsWithProducts = campaigns.map(campaign => ({
      ...campaign,
      products: productsByCampaign[campaign.id] || []
    }));
    
    console.log('✅ [LIST ACTIVE CAMPAIGNS] Found', campaigns.length, 'active campaigns');
    return { success: true, campaigns: campaignsWithProducts };
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
      category,
      image_url,
      image_urls = [],
      existing_images,
      ticket_price, 
      credits_per_ticket, 
      max_tickets_per_user, 
      status,
      start_at,
      end_at,
      use_end_date
    } = updateData;

    const connection = await pool.getConnection();
    
    await connection.execute(
      `UPDATE campaigns 
       SET title = ?, description = ?, category = ?, image_url = ?, ticket_price = ?, credits_per_ticket = ?, 
           max_tickets_per_user = ?, status = ?, start_at = ?, end_at = ?, use_end_date = ?
       WHERE id = ?`,
      [
        title || null, 
        description || null, 
        category || null,
        image_url || null, 
        ticket_price !== undefined ? ticket_price : 0, 
        credits_per_ticket !== undefined ? credits_per_ticket : 0, 
        max_tickets_per_user !== undefined ? max_tickets_per_user : null, 
        status || null, 
        start_at || null, 
        end_at || null, 
        use_end_date === 'false' || use_end_date === false ? 0 : 1,
        campaignId
      ]
    );

    // Handle images: delete old ones and insert new ones if new images uploaded
    if (image_urls && image_urls.length > 0) {
      // Parse existing_images if provided
      let keepImages = [];
      if (existing_images) {
        try {
          keepImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
        } catch (e) {
          keepImages = [];
        }
      }

      // Delete images not in keepImages
      await connection.execute('DELETE FROM campaign_images WHERE campaign_id = ?', [campaignId]);

      // Re-insert existing images first
      for (let i = 0; i < keepImages.length; i++) {
        await connection.execute(
          `INSERT INTO campaign_images (campaign_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
          [campaignId, keepImages[i], i === 0, i]
        );
      }

      // Insert new images
      const startOrder = keepImages.length;
      for (let i = 0; i < image_urls.length; i++) {
        await connection.execute(
          `INSERT INTO campaign_images (campaign_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
          [campaignId, image_urls[i], keepImages.length === 0 && i === 0, startOrder + i]
        );
      }

      // Update main image_url to first image
      const allImages = [...keepImages, ...image_urls];
      if (allImages.length > 0) {
        await connection.execute('UPDATE campaigns SET image_url = ? WHERE id = ?', [allImages[0], campaignId]);
      }
    }
    
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
