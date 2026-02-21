import pool from '../database/connection.js';

/**
 * Get all draws grouped by Upcoming and Past
 */
export async function getDraws(req, res) {
  try {
    const connection = await pool.getConnection();

    // 1. Get Past Draws (Winner already picked)
    // We look for prizes where at least one ticket is marked as winner
    const [pastDraws] = await connection.execute(`
      SELECT 
        pp.*,
        p.name as product_name,
        p.main_image_url as product_image,
        c.title as campaign_title,
        ct.ticket_number as winner_ticket,
        ct.won_at as draw_completed_at,
        CONCAT(cust.first_name, ' ', cust.last_name) as winner_name,
        cust.email as winner_email
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      JOIN campaign_tickets ct ON ct.product_id = pp.product_id AND ct.campaign_id = pp.campaign_id
      JOIN customers cust ON ct.customer_id = cust.id
      WHERE ct.is_winner = 1
      ORDER BY ct.won_at DESC
    `);

    // 2. Get Upcoming Draws (Ready to pick - Sold out or Expired, but no winner yet)
    // We look for prizes that are sold out or expired, and don't haunt a winner in campaign_tickets
    const [upcomingDraws] = await connection.execute(`
      SELECT 
        pp.*,
        p.name as product_name,
        p.main_image_url as product_image,
        c.title as campaign_title,
        c.end_at as campaign_end_at,
        c.use_end_date
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      WHERE 
        -- Sold out OR any deadline passed (campaign end, prize end, or draw date)
        (
          pp.tickets_remaining <= 0
          OR (c.use_end_date = 1 AND c.end_at IS NOT NULL AND c.end_at <= NOW())
          OR (pp.end_date IS NOT NULL AND pp.end_date <= NOW())
          OR (pp.draw_date IS NOT NULL AND pp.draw_date <= NOW())
        )
        -- And no winner picked yet for this specific prize
        AND NOT EXISTS (
          SELECT 1 FROM campaign_tickets ct 
          WHERE ct.product_id = pp.product_id 
          AND ct.campaign_id = pp.campaign_id 
          AND ct.is_winner = 1
        )
      ORDER BY pp.tickets_remaining ASC, pp.draw_date ASC
    `);

    // 3. Get Active Draws (Campaigns still running and have tickets left)
    const [activeDraws] = await connection.execute(`
      SELECT 
        pp.*,
        p.name as product_name,
        p.main_image_url as product_image,
        c.title as campaign_title,
        c.end_at as campaign_end_at,
        c.use_end_date
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      WHERE 
        c.status = 'active'
        AND pp.tickets_remaining > 0
        AND (c.use_end_date = 0 OR c.end_at IS NULL OR c.end_at > NOW())
        AND (pp.end_date IS NULL OR pp.end_date > NOW())
        AND (pp.draw_date IS NULL OR pp.draw_date > NOW())  -- exclude past draw dates
        AND NOT EXISTS (
          SELECT 1 FROM campaign_tickets ct 
          WHERE ct.product_id = pp.product_id 
          AND ct.campaign_id = pp.campaign_id 
          AND ct.is_winner = 1
        )
      ORDER BY pp.created_at DESC
    `);

    connection.release();

    res.json({
      success: true,
      upcoming: upcomingDraws,
      active: activeDraws,
      past: pastDraws
    });

  } catch (error) {
    console.error('Error fetching draws:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Get all tickets for a specific prize to perform draw
 */
export async function getPrizeTicketPool(req, res) {
  try {
    const { productId, campaignId } = req.params;
    console.log(`🔍 [POOL] Fetching tickets for Product: ${productId}, Campaign: ${campaignId}`);

    const [tickets] = await pool.execute(`
      SELECT 
        ct.*,
        COALESCE(CONCAT(cust.first_name, ' ', cust.last_name), 'Unknown') as customer_name,
        cust.email as customer_email,
        cust.phone_number as customer_phone,
        o.order_number
      FROM campaign_tickets ct
      LEFT JOIN customers cust ON ct.customer_id = cust.id
      LEFT JOIN orders o ON ct.order_id = o.id
      WHERE ct.product_id = ? AND ct.campaign_id = ?
      ORDER BY ct.created_at ASC
    `, [productId, campaignId]);

    console.log(`✅ [POOL] Found ${tickets.length} tickets`);

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching ticket pool:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching pool',
      error: error.message 
    });
  }
}

/**
 * PUBLIC: Get draws for Flutter app
 * Returns: active (live), upcoming (ready to draw), past (completed with winner)
 * No authentication required
 */
export async function getPublicDraws(req, res) {
  try {
    const connection = await pool.getConnection();

    // 1. PAST: Completed draws — winner already picked
    const [pastDraws] = await connection.execute(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.campaign_id,
        pp.tickets_required,
        pp.tickets_remaining,
        pp.draw_date,
        pp.end_date as prize_end_date,
        p.name as product_name,
        p.main_image_url as product_image,
        p.description as product_description,
        c.title as campaign_title,
        c.image_url as campaign_image,
        ct.ticket_number as winner_ticket,
        ct.won_at as draw_completed_at,
        CONCAT(cust.first_name, ' ', SUBSTRING(cust.last_name, 1, 1), '.') as winner_name
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      JOIN campaign_tickets ct ON ct.product_id = pp.product_id AND ct.campaign_id = pp.campaign_id AND ct.is_winner = 1
      JOIN customers cust ON ct.customer_id = cust.id
      ORDER BY ct.won_at DESC
      LIMIT 20
    `);

    // 2. UPCOMING: Ready to draw (sold out or expired) — no winner yet
    const [upcomingDraws] = await connection.execute(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.campaign_id,
        pp.tickets_required,
        pp.tickets_remaining,
        pp.draw_date,
        pp.end_date as prize_end_date,
        p.name as product_name,
        p.main_image_url as product_image,
        p.description as product_description,
        c.title as campaign_title,
        c.image_url as campaign_image,
        c.end_at as campaign_end_at,
        c.use_end_date
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      WHERE 
        (
          pp.tickets_remaining <= 0
          OR (c.use_end_date = 1 AND c.end_at IS NOT NULL AND c.end_at <= NOW())
          OR (pp.end_date IS NOT NULL AND pp.end_date <= NOW())
          OR (pp.draw_date IS NOT NULL AND pp.draw_date <= NOW())
        )
        AND NOT EXISTS (
          SELECT 1 FROM campaign_tickets ct 
          WHERE ct.product_id = pp.product_id 
          AND ct.campaign_id = pp.campaign_id 
          AND ct.is_winner = 1
        )
      ORDER BY pp.draw_date ASC
      LIMIT 20
    `);

    // 3. ACTIVE: Live draws — still selling tickets
    const [activeDraws] = await connection.execute(`
      SELECT 
        pp.id,
        pp.product_id,
        pp.campaign_id,
        pp.tickets_required,
        pp.tickets_remaining,
        pp.countdown_start_tickets,
        pp.draw_date,
        pp.end_date as prize_end_date,
        p.name as product_name,
        p.main_image_url as product_image,
        p.description as product_description,
        c.title as campaign_title,
        c.image_url as campaign_image,
        c.end_at as campaign_end_at,
        c.use_end_date,
        c.ticket_price,
        c.credits_per_ticket
      FROM product_prizes pp
      JOIN products p ON pp.product_id = p.id
      JOIN campaigns c ON pp.campaign_id = c.id
      WHERE 
        c.status = 'active'
        AND pp.is_active = 1
        AND pp.tickets_remaining > 0
        AND (c.use_end_date = 0 OR c.end_at IS NULL OR c.end_at > NOW())
        AND (pp.end_date IS NULL OR pp.end_date > NOW())
        AND (pp.draw_date IS NULL OR pp.draw_date > NOW())
        AND NOT EXISTS (
          SELECT 1 FROM campaign_tickets ct 
          WHERE ct.product_id = pp.product_id 
          AND ct.campaign_id = pp.campaign_id 
          AND ct.is_winner = 1
        )
      ORDER BY pp.created_at DESC
    `);

    connection.release();

    res.json({
      success: true,
      active: activeDraws,
      upcoming: upcomingDraws,
      past: pastDraws
    });

  } catch (error) {
    console.error('❌ [PUBLIC DRAWS] Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching draws' });
  }
}
