import mysql from "mysql2/promise";
import fs from "fs";

async function runSql() {
  const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";
  try {
    const connection = await mysql.createConnection(connectionString);
    const sqlFile = fs.readFileSync("drizzle/0000_clean_wendell_vaughn.sql", "utf-8");
    const statements = sqlFile.split("--> statement-breakpoint");
    
    for (let statement of statements) {
      statement = statement.trim();
      if (!statement) continue;
      console.log("Running statement:\n", statement);
      try {
        await connection.query(statement);
        console.log("SUCCESS");
      } catch (err) {
        console.error("FAILED with error:", err);
      }
    }
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}
runSql();
