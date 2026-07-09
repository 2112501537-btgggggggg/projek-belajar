import mysql from "mysql2/promise";

const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";

// Parse connection URL to get base connection credentials without database name
// Format: mysql://user:password@host:port/database
try {
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = url.port || "3306";
  const username = url.username;
  const password = url.password;
  const dbName = url.pathname.replace(/^\//, "");

  console.log(`Connecting to MySQL server at ${host}:${port} as ${username}...`);

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user: username,
    password: password
  });

  console.log(`Creating database "${dbName}" if it doesn't exist...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`Database "${dbName}" is ready.`);
  await connection.end();
  process.exit(0);
} catch (error: any) {
  console.error("Failed to create database:", error);
  process.exit(1);
}
