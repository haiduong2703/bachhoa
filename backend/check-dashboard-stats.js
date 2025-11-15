import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkOrderStats() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_NAME || "bach_hoa",
  });

  try {
    console.log("📊 Order Status Summary:");
    const [statusCount] = await connection.query(
      "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
    );
    statusCount.forEach((row) => {
      console.log(`  ${row.status}: ${row.count}`);
    });

    console.log("\n💰 Revenue by Status:");
    const [revenueByStatus] = await connection.query(
      "SELECT status, SUM(total_amount) as revenue FROM orders GROUP BY status"
    );
    revenueByStatus.forEach((row) => {
      console.log(
        `  ${row.status}: ${
          row.revenue ? row.revenue.toLocaleString() + " VND" : "0 VND"
        }`
      );
    });

    console.log("\n📈 Dashboard Stats Preview:");
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status = 'active') as totalUsers,
        (SELECT COUNT(*) FROM products WHERE status = 'active') as totalProducts,
        (SELECT COUNT(*) FROM orders) as totalOrders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('completed', 'delivered')) as totalRevenue,
        (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'packing')) as pendingOrders,
        (SELECT COUNT(*) FROM inventories WHERE quantity <= 10) as lowStockProducts
    `);

    console.log("Stats:", stats[0]);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkOrderStats();
