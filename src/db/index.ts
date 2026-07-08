import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";

const pool = mysql.createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });
