import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function dropAddressesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "bachhoa_db",
  });

  try {
    console.log("Dropping addresses table...");
    await connection.execute("DROP TABLE IF EXISTS addresses;");
    console.log("✅ Addresses table dropped successfully!");
  } catch (error) {
    console.error("❌ Error dropping addresses table:", error.message);
  } finally {
    await connection.end();
  }
}

dropAddressesTable();
