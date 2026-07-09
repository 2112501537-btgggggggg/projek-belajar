import mysql from "mysql2/promise";
import { db } from "./index";

async function reset() {
  const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";
  try {
    const connection = await mysql.createConnection(connectionString);
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE users;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Database tables truncated.");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
reset();
