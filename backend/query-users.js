import mysql from 'mysql2/promise';

async function queryUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Haiduong27@',
      database: 'bach_hoa'
    });

    // First check table structure
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables:', tables);

    const [userColumns] = await connection.execute('DESCRIBE users');
    console.log('Users table columns:', userColumns);

    const [userRoleColumns] = await connection.execute('DESCRIBE user_roles');
    console.log('User_roles table columns:', userRoleColumns);

    const [roleColumns] = await connection.execute('DESCRIBE roles');
    console.log('Roles table columns:', roleColumns);

    const [users] = await connection.execute(`
      SELECT
        u.*,
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));

    await connection.end();
  } catch (error) {
    console.error('Error querying users:', error);
  }
}

queryUsers();
