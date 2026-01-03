import pool from '../database/connection.js';

/**
 * Get all campaign tickets (Admin only)
 */
export async function getAllTickets(req, res) {
  try {
    const { status, campaign_id, customer_id, page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        ct.*,
        c.title as campaign_title,
        CONCAT(cust.first_name, ' ', cust.last_name) as customer_name,
        cust.email as customer_email,
        o.order_number
      FROM campaign_tickets ct
      LEFT JOIN campaigns c ON ct.campaign_id = c.id
      LEFT JOIN customers cust ON ct.customer_id = cust.id
      LEFT JOIN orders o ON ct.order_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND ct.status = ?`;
      params.push(status);
    }

    if (campaign_id) {
      query += ` AND ct.campaign_id = ?`;
      params.push(campaign_id);
    }

    if (customer_id) {
      query += ` AND ct.customer_id = ?`;
      params.push(customer_id);
    }

    query += ` ORDER BY ct.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit));
    params.push(offset);

    const [tickets] = await pool.query(query, params);

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
