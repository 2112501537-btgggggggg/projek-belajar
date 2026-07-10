import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/users";
import mysql from "mysql2/promise";
import { db } from "../src/db";
import { users } from "../src/db/schema";

const app = new Elysia().use(userRoutes);

async function resetDatabase() {
  const connectionString = Bun.env.DATABASE_URL || "mysql://root:password@localhost:3306/projek_belajar";
  const connection = await mysql.createConnection(connectionString);
  await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
  await connection.query("TRUNCATE TABLE session;");
  await connection.query("TRUNCATE TABLE users;");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
  await connection.end();
}

describe("Users CRUD API (/users)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("GET /", () => {
    it("should return list of users (empty array if none)", async () => {
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(0);
    });

    it("should return all existing users", async () => {
      // Seed users
      await db.insert(users).values([
        { name: "Alice", email: "alice@example.com", password: "password123" },
        { name: "Bob", email: "bob@example.com", password: "password123" },
      ]);

      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2);
      expect(body.data[0].name).toBe("Alice");
      expect(body.data[1].name).toBe("Bob");
    });
  });

  describe("POST /", () => {
    it("should create a new user with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Charlie",
            email: "charlie@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("User created successfully");
    });

    it("should fail validation if name or email is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Charlie",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("GET /:id", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await db.insert(users).values({
        name: "David",
        email: "david@example.com",
        password: "password123",
      });
      userId = Number(result[0].insertId);
    });

    it("should retrieve a user by valid ID", async () => {
      const response = await app.handle(
        new Request(`http://localhost/users/${userId}`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("David");
    });

    it("should fail if user is not found", async () => {
      const response = await app.handle(
        new Request(`http://localhost/users/${userId + 999}`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(200); // Note: API returns success: false, not 404
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("User not found");
    });

    it("should fail with invalid ID format (not a number)", async () => {
      const response = await app.handle(
        new Request("http://localhost/users/invalid-id", {
          method: "GET",
        })
      );

      expect(response.status).toBe(200); // Note: API returns success: false, not 400
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid ID format");
    });
  });

  describe("PUT /:id", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await db.insert(users).values({
        name: "Eve",
        email: "eve@example.com",
        password: "password123",
      });
      userId = Number(result[0].insertId);
    });

    it("should successfully update user details", async () => {
      const response = await app.handle(
        new Request(`http://localhost/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eve Updated",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("User updated successfully");

      // Verify DB update
      const updatedUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });
      expect(updatedUser?.name).toBe("Eve Updated");
    });

    it("should fail to update with invalid ID format", async () => {
      const response = await app.handle(
        new Request("http://localhost/users/invalid-id", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eve Updated",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid ID format");
    });
  });

  describe("DELETE /:id", () => {
    let userId: number;

    beforeEach(async () => {
      const result = await db.insert(users).values({
        name: "Frank",
        email: "frank@example.com",
        password: "password123",
      });
      userId = Number(result[0].insertId);
    });

    it("should successfully delete a user", async () => {
      const response = await app.handle(
        new Request(`http://localhost/users/${userId}`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("User deleted successfully");

      // Verify deletion
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });
      expect(user).toBeUndefined();
    });

    it("should fail to delete with invalid ID format", async () => {
      const response = await app.handle(
        new Request("http://localhost/users/invalid-id", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid ID format");
    });
  });
});
