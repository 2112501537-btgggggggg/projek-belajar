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
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
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
    })
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
  });
