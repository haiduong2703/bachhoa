import mysql from 'mysql2/promise';

async function queryReports() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Haiduong27@',
      database: 'bach_hoa'
    });

    // Total stats
    const [userStats] = await connection.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [productStats] = await connection.execute('SELECT COUNT(*) as totalProducts FROM products');
    const [orderStats] = await connection.execute('SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue FROM orders');
    
    // Orders by status
    const [ordersByStatus] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // Recent orders for sales data
    const [recentOrders] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        COUNT(DISTINCT user_id) as customers
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Top products (we'll need to join with order_items)
    const [topProducts] = await connection.execute(`
      SELECT
        p.id,
        p.name,
        SUM(oi.quantity) as sales,
        SUM(oi.total_price) as revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Customer stats
    const [customerStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT user_id) as totalCustomers,
        AVG(total_amount) as averageOrderValue
      FROM orders
    `);

    // Top customers
    const [topCustomers] = await connection.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        COUNT(o.id) as orders,
        SUM(o.total_amount) as spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY spent DESC
      LIMIT 5
    `);

    const dashboardStats = {
      totalUsers: userStats[0].totalUsers,
      totalProducts: productStats[0].totalProducts,
      totalOrders: orderStats[0].totalOrders,
      totalRevenue: parseFloat(orderStats[0].totalRevenue || 0),
      // Mock growth data since we don't have historical data
      revenueGrowth: 15.2,
      ordersGrowth: 8.5,
      customersGrowth: 12.3,
      productsGrowth: 5.1
    };

    const salesData = recentOrders.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue),
      orders: row.orders,
      customers: row.customers
    }));

    const topProductsData = topProducts.map((product, index) => ({
      id: product.id,
      name: product.name,
      sales: product.sales,
      revenue: parseFloat(product.revenue),
      growth: (Math.random() * 30 - 10) // Mock growth data
    }));

    const customerStatsData = {
      newCustomers: Math.floor(dashboardStats.totalUsers * 0.2), // Mock: 20% new
      returningCustomers: Math.floor(dashboardStats.totalUsers * 0.8), // Mock: 80% returning
      averageOrderValue: parseFloat(customerStats[0].averageOrderValue || 0),
      customerLifetimeValue: parseFloat(customerStats[0].averageOrderValue || 0) * 5, // Mock: 5x AOV
      topCustomers: topCustomers.map(customer => ({
        name: `${customer.first_name} ${customer.last_name}`,
        orders: customer.orders,
        spent: parseFloat(customer.spent)
      }))
    };

    console.log('Dashboard Stats:');
    console.log(JSON.stringify(dashboardStats, null, 2));
    
    console.log('\nSales Data:');
    console.log(JSON.stringify(salesData, null, 2));
    
    console.log('\nTop Products:');
    console.log(JSON.stringify(topProductsData, null, 2));
    
    console.log('\nCustomer Stats:');
    console.log(JSON.stringify(customerStatsData, null, 2));

    console.log('\nOrders by Status:');
    console.log(JSON.stringify(ordersByStatus, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error querying reports:', error);
  }
}

queryReports();
