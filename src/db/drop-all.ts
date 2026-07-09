import mysql from "mysql2/promise";

async function dropAll() {
  const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";
  try {
    const connection = await mysql.createConnection(connectionString);
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("DROP TABLE IF EXISTS `session`;");
    await connection.query("DROP TABLE IF EXISTS `users`;");
    await connection.query("DROP TABLE IF EXISTS `__drizzle_migrations`;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("All tables dropped successfully.");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
dropAll();
