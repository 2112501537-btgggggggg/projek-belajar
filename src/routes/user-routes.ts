import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      
      if (!result.success) {
        set.status = 400;
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String()
    }),
    detail: {
      tags: ["Auth"],
      summary: "Register new user",
      description: "Creates a new user account with name, email, and password."
    }
  })
  .post("/login", async ({ body, set }) => {
    try {
      const result = await loginUser(body);
      
      if (!result.success) {
        set.status = 400;
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    }),
    detail: {
      tags: ["Auth"],
      summary: "Login user",
      description: "Authenticates user credentials and returns a session token."
    }
  })
  .derive(({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { token: null };
    }
    const token = authHeader.substring(7).trim();
    return { token: token || null };
  })
  .get("/current", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const result = await getCurrentUser(token);

      if (!result.success) {
        set.status = 401;
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    headers: t.Object({
      authorization: t.Optional(t.String({ description: "Bearer token" }))
    }),
    detail: {
      tags: ["Auth"],
      summary: "Get current user",
      description: "Retrieves details of the currently authenticated user session."
    }
  })
  .delete("/logout", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const result = await logoutUser(token);

      if (!result.success) {
        set.status = 401;
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  }, {
    headers: t.Object({
      authorization: t.Optional(t.String({ description: "Bearer token" }))
    }),
    detail: {
      tags: ["Auth"],
      summary: "Logout user",
      description: "Destroys the current user session session token."
    }
  });
