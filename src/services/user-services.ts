import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, session } from "../db/schema";
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

export async function loginUser(data: any) {
  const { email, password } = data;

  // Cari user berdasarkan email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { success: false, error: "email atau password salah" };
  }

  // Bandingkan password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, error: "email atau password salah" };
  }

  // Generate token UUID
  const token = crypto.randomUUID();

  // Simpan session
  await db.insert(session).values({
    token,
    userId: user.id,
  });

  return { success: true, data: token };
}

export async function getCurrentUser(token: string) {
  const sessionData = await db.query.session.findFirst({
    where: eq(session.token, token),
  });

  if (!sessionData) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionData.userId),
  });

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  return {
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
    },
  };
}

