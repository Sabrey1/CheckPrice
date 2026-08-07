import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { users } from "../db/schema/users";

type Bindings = {
  DB: D1Database;
};

export const login = new Hono<{ Bindings: Bindings }>();

login.post("/", async (c) => {
  try {
    const db = drizzle(c.env.DB);

    const body = await c.req.json();

    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return c.json(
        {
          success: false,
          message: "Username and password are required",
        },
        400
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, username),
          eq(users.password, password)
        )
      )
      .limit(1);

    if (user.length === 0) {
      return c.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        401
      );
    }

    return c.json({
      success: true,
      message: "Login successful",
      data: user[0],
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
});

export default login;