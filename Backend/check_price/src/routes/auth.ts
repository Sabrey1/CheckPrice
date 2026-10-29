import { sign } from "hono/jwt";
import { getDB } from "../config/db";
import { hashPassword, needsRehash, verifyPassword } from "../lib/password";
import { loginRateLimiter } from "../middleware/rate-limit";
import type { AppEnv } from "../middleware/auth";

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { users } from "../db/schema/users";
import { branchs } from "../db/schema/branch";
import { roles } from "../db/schema/role";

export const login = new Hono<AppEnv>();

login.use("*", loginRateLimiter);

login.post("/", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    let body;

    // Parse and validate JSON
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        {
          success: false,
          message: "Invalid JSON format",
        },
        400
      );
    }

    // Validate input types and structure
    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      typeof body.username !== "string" ||
      typeof body.password !== "string"
    ) {
      return c.json(
        {
          success: false,
          message: "Username and password must be strings",
        },
        400
      );
    }

    const username = body.username.trim();
    const password = body.password.trim();

    // Length validation
    if (username.length === 0 || username.length > 100) {
      return c.json(
        {
          success: false,
          message: "Username must be between 1 and 100 characters",
        },
        400
      );
    }

    if (password.length === 0 || password.length > 100) {
      return c.json(
        {
          success: false,
          message: "Password must be between 1 and 100 characters",
        },
        400
      );
    }

    const [row] = await db
    .select ({
      id : users.id,
      username : users.username,
      password : users.password,
      full_name : users.full_name,
      phone : users.phone,
      email : users.email,
      branch_id : users.branch_id,
      role_id : users.role_id,
      brach_name : branchs.name,
      role_name : roles.name,
    }).from (users)
    .leftJoin(branchs, eq(users.branch_id, branchs.id))
    .leftJoin(roles, eq(users.role_id, roles.id))
    .where(eq(users.username, username))
    .limit(1);

    if (!row || !(await verifyPassword(password, row.password))) {
      return c.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        401
      );
    }

    if(needsRehash(row.password)) {
      await db
      .update(users)
      .set({
        password: await hashPassword(password),
      }).where(eq(users.id, row.id));
    }

    // Use the selected row values, not the Drizzle table/column definitions.
    // Passing `users.id` etc. serializes the schema (which is circular) and
    // throws "Converting circular structure to JSON" inside sign().
    const token = await sign({
      sub: String(row.id),
      role_id: row.role_id,
      branch_id: row.branch_id,
      role_name: row.role_name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }, c.env.JWT_SECRET, "HS256");

    const { password: _password, ...user } = row;

    return c.json({
      success: true,
      message: "Login successful",
      data: user,
      token
    })
  } catch (error) {
    console.error("Login failed:", error);

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