import bcrypt from "bcrypt";
import sequelize from "./src/database/config.js";

const resetAdminPassword = async () => {
  try {
    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const [result] = await sequelize.query(
      `
      UPDATE users 
      SET password = :password 
      WHERE email = 'admin@bachhoa.com'
    `,
      {
        replacements: { password: hashedPassword },
      }
    );

    console.log("✅ Admin password reset successfully!");
    console.log("Email: admin@bachhoa.com");
    console.log("Password:", newPassword);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetAdminPassword();
