import pool from '../database/connection.js';

/**
 * Get comprehensive ticket statistics (Admin Only)
 */
export async function getTicketStats(req, res) {
  try {
    console.log('📊 [TICKET STATS] Request received');
    
    const connection = await pool.getConnection();

    // 1. Total tickets sold
    const [totalTicketsRes] = await connection.execute(
      `SELECT COUNT(*) as total_tickets, SUM(quantity) as total_quantity, SUM(total_price) as total_revenue
       FROM campaign_tickets`
    );

    // 2. Tickets by campaign
    const [campaignTicketsRes] = await connection.execute(
      `SELECT 
         c.id, c.title, 
         COUNT(ct.id) as unique_tickets, 
         SUM(ct.quantity) as total_quantity,
         SUM(ct.total_price) as total_revenue,
         AVG(ct.total_price) as avg_ticket_value
       FROM campaigns c
       LEFT JOIN campaign_tickets ct ON c.id = ct.campaign_id
       GROUP BY c.id, c.title
       ORDER BY total_quantity DESC`
    );

    // 3. Recent ticket sales (last 10)
    const [recentTicketsRes] = await connection.execute(
      `SELECT 
         ct.ticket_number, ct.quantity, ct.total_price, ct.credits_earned, ct.created_at,
         c.title as campaign_title,
         CONCAT(cu.first_name, ' ', cu.last_name) as customer_name
       FROM campaign_tickets ct
       JOIN campaigns c ON ct.campaign_id = c.id
       JOIN customers cu ON ct.customer_id = cu.id
       ORDER BY ct.created_at DESC
       LIMIT 10`
    );

    // 4. Top customers by tickets
    const [topCustomersRes] = await connection.execute(
      `SELECT 
         cu.id, CONCAT(cu.first_name, ' ', cu.last_name) as customer_name, cu.email,
         COUNT(ct.id) as unique_tickets,
         SUM(ct.quantity) as total_quantity,
         SUM(ct.total_price) as total_spent
       FROM customers cu
       JOIN campaign_tickets ct ON cu.id = ct.customer_id
       GROUP BY cu.id, cu.first_name, cu.last_name, cu.email
       ORDER BY total_quantity DESC
       LIMIT 10`
    );

    // 5. Daily ticket sales (last 30 days)
    const [dailySalesRes] = await connection.execute(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as tickets_sold,
         SUM(quantity) as total_quantity,
         SUM(total_price) as daily_revenue
       FROM campaign_tickets
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // 6. Active campaigns with ticket counts
    const [activeCampaignsRes] = await connection.execute(
      `SELECT 
         c.id, c.title, c.ticket_price, c.credits_per_ticket, c.max_tickets_per_user,
         COUNT(ct.id) as participants,
         SUM(ct.quantity) as total_tickets_sold,
         SUM(ct.total_price) as campaign_revenue
       FROM campaigns c
       LEFT JOIN campaign_tickets ct ON c.id = ct.campaign_id
       WHERE c.status = 'active'
       GROUP BY c.id, c.title, c.ticket_price, c.credits_per_ticket, c.max_tickets_per_user
       ORDER BY campaign_revenue DESC`
    );

    connection.release();

    const stats = {
      overview: {
        total_tickets: totalTicketsRes[0]?.total_tickets || 0,
        total_quantity: totalTicketsRes[0]?.total_quantity || 0,
        total_revenue: parseFloat(totalTicketsRes[0]?.total_revenue || 0)
      },
      by_campaign: campaignTicketsRes,
      recent_sales: recentTicketsRes,
      top_customers: topCustomersRes,
      daily_sales: dailySalesRes,
      active_campaigns: activeCampaignsRes
    };

    console.log('✅ [TICKET STATS] Success');
    console.log('   Total Tickets:', stats.overview.total_tickets);
    console.log('   Total Revenue:', stats.overview.total_revenue);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [TICKET STATS] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ticket stats'
    });
  }
}

/**
 * Get ticket statistics for specific campaign
 */
export async function getCampaignTicketStats(req, res) {
  try {
    const campaignId = parseInt(req.params.id);
    console.log('📊 [CAMPAIGN TICKET STATS] Request received');
    console.log('   Campaign ID:', campaignId);

    const connection = await pool.getConnection();

    // Campaign details with ticket stats
    const [campaignRes] = await connection.execute(
      `SELECT 
         c.*,
         COUNT(ct.id) as participants,
         SUM(ct.quantity) as total_tickets_sold,
         SUM(ct.total_price) as total_revenue,
         AVG(ct.total_price) as avg_ticket_value
       FROM campaigns c
       LEFT JOIN campaign_tickets ct ON c.id = ct.campaign_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [campaignId]
    );

    if (campaignRes.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Ticket breakdown by customer
    const [customerBreakdownRes] = await connection.execute(
      `SELECT 
         cu.id, CONCAT(cu.first_name, ' ', cu.last_name) as customer_name, cu.email,
         ct.ticket_number, ct.quantity, ct.total_price, ct.credits_earned, ct.created_at
       FROM campaign_tickets ct
       JOIN customers cu ON ct.customer_id = cu.id
       WHERE ct.campaign_id = ?
       ORDER BY ct.created_at DESC`,
      [campaignId]
    );

    connection.release();

    const campaign = campaignRes[0];
    const stats = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        ticket_price: campaign.ticket_price,
        credits_per_ticket: campaign.credits_per_ticket,
        max_tickets_per_user: campaign.max_tickets_per_user,
        participants: campaign.participants || 0,
        total_tickets_sold: campaign.total_tickets_sold || 0,
        total_revenue: parseFloat(campaign.total_revenue || 0),
        avg_ticket_value: parseFloat(campaign.avg_ticket_value || 0)
      },
      customer_breakdown: customerBreakdownRes
    };

    console.log('✅ [CAMPAIGN TICKET STATS] Success');

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [CAMPAIGN TICKET STATS] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching campaign ticket stats'
    });
  }
}
