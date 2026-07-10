import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "../src/routes/user-routes";
import mysql from "mysql2/promise";

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

describe("Auth API (/api/users)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST /", () => {
    it("should successfully register a new user", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: "OK" });
    });

    it("should fail to register if email is already registered", async () => {
      // Register first
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Register again
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("email sudah terdaftar");
    });

    it("should fail to register with invalid validation (missing fields)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            // missing email and password
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Seed a user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
    });

    it("should fail login with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "wrong@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("email atau password salah");
    });

    it("should fail login with incorrect password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("email atau password salah");
    });
  });

  describe("GET /current", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Login to get token
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const body = await response.json();
      token = body.data;
    });

    it("should successfully retrieve current user info with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.name).toBe("John Doe");
      expect(body.data.email).toBe("john@example.com");
    });

    it("should fail to retrieve user info without authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should fail to retrieve user info with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: "Bearer invalid-token" },
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("DELETE /logout", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Login to get token
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const body = await response.json();
      token = body.data;
    });

    it("should successfully logout with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBe("Ok");

      // Verify token is no longer usable
      const checkResponse = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(checkResponse.status).toBe(401);
    });

    it("should fail to logout without authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should fail to logout with invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { Authorization: "Bearer invalid-token" },
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });
  });
});
