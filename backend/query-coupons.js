import mysql from 'mysql2/promise';

async function queryCoupons() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Haiduong27@',
      database: 'bach_hoa'
    });

    const [coupons] = await connection.execute(`
      SELECT * FROM coupons 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('Coupons in database:');
    console.log(JSON.stringify(coupons, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error querying coupons:', error);
  }
}

queryCoupons();
