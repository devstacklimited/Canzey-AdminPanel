import pool from '../database/connection.js';

/**
 * Get Dashboard Stats (Admin Only)
 */
export async function getDashboardStats(req, res) {
  try {
    // 1. Total Revenue (from paid orders)
    const [revenueRes] = await pool.query(
      `SELECT SUM(total_amount) as total_revenue FROM orders WHERE payment_status = 'paid'`
    );
    const totalRevenue = revenueRes[0].total_revenue || 0;

    // 2. Total Orders
    const [ordersRes] = await pool.query(
      `SELECT COUNT(*) as total_orders FROM orders`
    );
    const totalOrders = ordersRes[0].total_orders || 0;

    // 3. Total Customers
    const [customersRes] = await pool.query(
      `SELECT COUNT(*) as total_customers FROM customers`
    );
    const totalCustomers = customersRes[0].total_customers || 0;

    // 4. Active Orders (Pending or Processing)
    const [activeOrdersRes] = await pool.query(
      `SELECT COUNT(*) as active_orders FROM orders WHERE order_status IN ('pending', 'processing')`
    );
    const activeOrders = activeOrdersRes[0].active_orders || 0;

    // 5. Recent Orders (Last 5)
    const [recentOrders] = await pool.query(
      `SELECT o.*, 
              CONCAT(c.first_name, ' ', c.last_name) as customer_name,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o 
       JOIN customers c ON o.customer_id = c.id 
       ORDER BY o.created_at DESC 
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        activeOrders
      },
      recentOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
