import mysql from 'mysql2/promise';

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Haiduong27@',
      database: 'bach_hoa'
    });

    console.log('Order Items table structure:');
    const [orderItemsColumns] = await connection.execute('DESCRIBE order_items');
    console.log(JSON.stringify(orderItemsColumns, null, 2));

    console.log('\nSample order items data:');
    const [orderItems] = await connection.execute('SELECT * FROM order_items LIMIT 5');
    console.log(JSON.stringify(orderItems, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();
