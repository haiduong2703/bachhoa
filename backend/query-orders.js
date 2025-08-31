import mysql from 'mysql2/promise';

async function queryOrders() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Haiduong27@',
      database: 'bach_hoa'
    });

    const [orders] = await connection.execute(`
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    console.log('Orders in database:');
    console.log(JSON.stringify(orders, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error querying orders:', error);
  }
}

queryOrders();
