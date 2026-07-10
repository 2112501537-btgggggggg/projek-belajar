import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    try {
      const data = await db.query.users.findMany();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Array(t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        createdAt: t.Any()
      }))),
      error: t.Optional(t.String())
    }, { description: "Returns status and optional user list or error message" }),
    detail: {
      tags: ["User Management"],
      summary: "Get all users",
      description: "Retrieves a list of all registered users in the system."
    }
  })
  .post("/", async ({ body }) => {
    try {
      await db.insert(users).values(body);
      return { success: true, message: "User created successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    }),
    response: t.Object({
      success: t.Boolean(),
      message: t.Optional(t.String()),
      error: t.Optional(t.String())
    }, { description: "Returns success status and message or error" }),
    detail: {
      tags: ["User Management"],
      summary: "Create a user",
      description: "Creates a new user directly in the database (admin operation)."
    }
  })
  .get("/:id", async ({ params: { id } }) => {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return { success: false, error: "Invalid ID format" };
      }
      const user = await db.query.users.findFirst({
        where: eq(users.id, numericId),
      });
      if (!user) {
        return { success: false, error: "User not found" };
      }
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    params: t.Object({
      id: t.String({ description: "Numeric ID of the user" })
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        createdAt: t.Any()
      })),
      error: t.Optional(t.String())
    }, { description: "Returns success status and optional user details or error" }),
    detail: {
      tags: ["User Management"],
      summary: "Get user by ID",
      description: "Retrieves the details of a single user by their numeric ID."
    }
  })
  .put("/:id", async ({ params: { id }, body }) => {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return { success: false, error: "Invalid ID format" };
      }
      await db.update(users).set(body).where(eq(users.id, numericId));
      return { success: true, message: "User updated successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    params: t.Object({
      id: t.String({ description: "Numeric ID of the user to update" })
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
    response: t.Object({
      success: t.Boolean(),
      message: t.Optional(t.String()),
      error: t.Optional(t.String())
    }, { description: "Returns success status and update status message or error" }),
    detail: {
      tags: ["User Management"],
      summary: "Update user by ID",
      description: "Updates details of a single user by their numeric ID."
    }
  })
  .delete("/:id", async ({ params: { id } }) => {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return { success: false, error: "Invalid ID format" };
      }
      await db.delete(users).where(eq(users.id, numericId));
      return { success: true, message: "User deleted successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    params: t.Object({
      id: t.String({ description: "Numeric ID of the user to delete" })
    }),
    response: t.Object({
      success: t.Boolean(),
      message: t.Optional(t.String()),
      error: t.Optional(t.String())
    }, { description: "Returns success status and deletion message or error" }),
    detail: {
      tags: ["User Management"],
      summary: "Delete user by ID",
      description: "Deletes a single user from the database by their numeric ID."
    }
  });
