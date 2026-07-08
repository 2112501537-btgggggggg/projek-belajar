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
    })
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
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
    })
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
  });
