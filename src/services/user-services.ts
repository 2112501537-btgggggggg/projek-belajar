import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import * as bcrypt from "bcrypt";

export async function registerUser(data: any) {
  const { name, email, password } = data;

  // Cek apakah email sudah ada
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { success: false, error: "email sudah terdaftar" };
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user baru
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true, data: "OK" };
}
