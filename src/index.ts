import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes as authRoutes } from "./routes/user-routes";
import { userRoutes as crudRoutes } from "./routes/users";

const port = Bun.env.PORT || 3000;

const app = new Elysia()
  .use(swagger({
    path: "/swagger",
    documentation: {
      info: {
        title: "Projek Belajar API Documentation",
        version: "1.0.0",
      },
    },
  }))
  .use(authRoutes)
  .use(crudRoutes)
  .get("/", () => ({ message: "Welcome to ElysiaJS backend with Drizzle and MySQL!" }))
  .listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 Swagger API documentation available at http://localhost:${port}/swagger`);
