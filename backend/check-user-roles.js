import sequelize from "./src/database/config.js";

const checkUserRoles = async () => {
  try {
    const [users] = await sequelize.query(`
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name,
        r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id, r.name
    `);

    console.log("\n📊 Users and their roles:\n");

    const userMap = {};
    users.forEach((row) => {
      if (!userMap[row.id]) {
        userMap[row.id] = {
          id: row.id,
          email: row.email,
          name: `${row.first_name} ${row.last_name}`,
          roles: [],
        };
      }
      if (row.role_name) {
        userMap[row.id].roles.push(row.role_name);
      }
    });

    Object.values(userMap).forEach((user) => {
      console.log(`ID: ${user.id} | ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(
        `   Roles: ${
          user.roles.length > 0 ? user.roles.join(", ") : "❌ NO ROLES"
        }`
      );
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUserRoles();
