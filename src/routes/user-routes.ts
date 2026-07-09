import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-services";

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
  });
