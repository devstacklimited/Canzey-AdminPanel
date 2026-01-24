import pool from '../database/connection.js';

/**
 * Generate unique ticket number
 */
function generateTicketNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TKT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Customer participates in campaign (buys ticket)
 */
export async function participateInCampaign(customerId, campaignId, quantity = 1) {
  const connection = await pool.getConnection();
  
  try {
    console.log('🎫 [PARTICIPATE CAMPAIGN] Request received');
    console.log('   Customer ID:', customerId);
    console.log('   Campaign ID:', campaignId);
    console.log('   Quantity:', quantity);

    await connection.beginTransaction();

    // Get campaign details
    const [campaigns] = await connection.execute(
      'SELECT * FROM campaigns WHERE id = ? AND status = "active"',
      [campaignId]
    );

    if (campaigns.length === 0) {
      await connection.rollback();
      return { success: false, error: 'Campaign not found or not active' };
    }

    const campaign = campaigns[0];

    // Check if campaign is within date range
    const now = new Date();
    if (campaign.start_at && new Date(campaign.start_at) > now) {
      await connection.rollback();
      return { success: false, error: 'Campaign has not started yet' };
    }

    if (campaign.end_at && new Date(campaign.end_at) < now) {
      await connection.rollback();
      return { success: false, error: 'Campaign has ended' };
    }

    // Check max tickets per user limit
    if (campaign.max_tickets_per_user) {
      const [existingTickets] = await connection.execute(
        'SELECT SUM(quantity) as total_tickets FROM campaign_tickets WHERE customer_id = ? AND campaign_id = ?',
        [customerId, campaignId]
      );

      const currentTickets = existingTickets[0]?.total_tickets || 0;
      if (currentTickets + quantity > campaign.max_tickets_per_user) {
        await connection.rollback();
        return { 
          success: false, 
          error: `Maximum ${campaign.max_tickets_per_user} tickets allowed per user. You already have ${currentTickets} tickets.` 
        };
      }
    }

    // Calculate totals
    const totalPrice = parseFloat(campaign.ticket_price) * quantity;
    const creditsEarned = campaign.credits_per_ticket * quantity;
    const ticketNumber = generateTicketNumber();

    // Create ticket record
    const [ticketResult] = await connection.execute(
      `INSERT INTO campaign_tickets 
       (campaign_id, customer_id, ticket_number, quantity, total_price, credits_earned) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [campaignId, customerId, ticketNumber, quantity, totalPrice, creditsEarned]
    );

    const ticketId = ticketResult.insertId;

    // Add credits to customer (expires in 6 months)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    await connection.execute(
      `INSERT INTO customer_credits 
       (customer_id, ticket_id, credits, type, description, expires_at) 
       VALUES (?, ?, ?, 'earned', ?, ?)`,
      [
        customerId, 
        ticketId, 
        creditsEarned, 
        `Earned from campaign: ${campaign.title}`,
        expiresAt
      ]
    );

    await connection.commit();

    console.log('✅ [PARTICIPATE CAMPAIGN] Success');
    console.log('   Ticket Number:', ticketNumber);
    console.log('   Credits Earned:', creditsEarned);

    return {
      success: true,
      message: 'Successfully participated in campaign',
      ticket: {
        id: ticketId,
        ticket_number: ticketNumber,
        campaign_title: campaign.title,
        quantity: quantity,
        total_price: totalPrice,
        credits_earned: creditsEarned,
        expires_at: expiresAt
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('❌ [PARTICIPATE CAMPAIGN] Error:', error.message);
    return { success: false, error: 'Server error during participation' };
  } finally {
    connection.release();
  }
}

/**
 * Get customer credit balance (only non-expired credits)
 */
export async function getCustomerCreditBalance(customerId) {
  try {
    console.log('💰 [GET CREDIT BALANCE] Request received');
    console.log('   Customer ID:', customerId);

    const connection = await pool.getConnection();

    // Get total earned credits (not expired)
    const [earnedResult] = await connection.execute(
      `SELECT SUM(credits) as total_earned 
       FROM customer_credits 
       WHERE customer_id = ? AND type = 'earned' 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [customerId]
    );

    // Get total spent credits
    const [spentResult] = await connection.execute(
      `SELECT SUM(credits) as total_spent 
       FROM customer_credits 
       WHERE customer_id = ? AND type = 'spent'`,
      [customerId]
    );

    const totalEarned = earnedResult[0]?.total_earned || 0;
    const totalSpent = spentResult[0]?.total_spent || 0;
    const availableBalance = totalEarned - totalSpent;

    connection.release();

    console.log('✅ [GET CREDIT BALANCE] Success');
    console.log('   Available Balance:', availableBalance);

    return {
      success: true,
      balance: {
        available: availableBalance,
        total_earned: totalEarned,
        total_spent: totalSpent
      }
    };

  } catch (error) {
    console.error('❌ [GET CREDIT BALANCE] Error:', error.message);
    return { success: false, error: 'Server error while fetching balance' };
  }
}

/**
 * Get customer tickets
 */
export async function getCustomerTickets(customerId) {
  try {
    console.log('🎫 [GET CUSTOMER TICKETS] Request received');
    console.log('   Customer ID:', customerId);

    const connection = await pool.getConnection();

    const [tickets] = await connection.execute(
      `SELECT 
        ct.id, ct.ticket_number, ct.quantity, ct.total_price, ct.credits_earned, 
        ct.status, ct.created_at,
        c.title as campaign_title, c.image_url as campaign_image,
        (
          SELECT JSON_OBJECT(
            'product_id', p.id,
            'product_name', p.name,
            'product_image', p.main_image_url,
            'color', oi.color,
            'size', oi.size
          )
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = (
            SELECT o.id FROM orders o 
            WHERE o.customer_id = ct.customer_id 
            ORDER BY o.created_at DESC 
            LIMIT 1
          )
          AND p.id IN (
            SELECT product_id FROM campaign_prizes 
            WHERE campaign_id = ct.campaign_id
          )
          LIMIT 1
        ) as product_info
       FROM campaign_tickets ct
       JOIN campaigns c ON ct.campaign_id = c.id
       WHERE ct.customer_id = ?
       ORDER BY ct.created_at DESC`,
      [customerId]
    );

    connection.release();

    console.log('✅ [GET CUSTOMER TICKETS] Found', tickets.length, 'tickets');

    return {
      success: true,
      tickets: tickets
    };

  } catch (error) {
    console.error('❌ [GET CUSTOMER TICKETS] Error:', error.message);
    return { success: false, error: 'Server error while fetching tickets' };
  }
}

/**
 * Get customer credit history
 */
export async function getCustomerCreditHistory(customerId) {
  try {
    console.log('📊 [GET CREDIT HISTORY] Request received');
    console.log('   Customer ID:', customerId);

    const connection = await pool.getConnection();

    const [history] = await connection.execute(
      `SELECT 
        cc.id, cc.credits, cc.type, cc.description, cc.expires_at, cc.created_at,
        ct.ticket_number
       FROM customer_credits cc
       LEFT JOIN campaign_tickets ct ON cc.ticket_id = ct.id
       WHERE cc.customer_id = ?
       ORDER BY cc.created_at DESC
       LIMIT 50`,
      [customerId]
    );

    connection.release();

    console.log('✅ [GET CREDIT HISTORY] Found', history.length, 'records');

    return {
      success: true,
      history: history
    };

  } catch (error) {
    console.error('❌ [GET CREDIT HISTORY] Error:', error.message);
    return { success: false, error: 'Server error while fetching history' };
  }
}
