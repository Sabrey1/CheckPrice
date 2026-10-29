import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { Env } from "../types/env";

export type JwtUser = {
  sub: string;          // user id
  role_id: number;
  role_name: string | null;
  branch_id: number;
  exp: number;
};

export type AppEnv = {
  Bindings: Env;
  Variables: { user: JwtUser };
};

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  try {
    const payload = (await verify(
      header.slice(7),
      c.env.JWT_SECRET,
      "HS256"
    )) as JwtUser;

    c.set("user", payload);
  } catch {
    // bad signature, malformed, or expired
    return c.json({ success: false, message: "Invalid or expired token" }, 401);
  }

  await next();
};

// Optional extras: role-based access
export const requireRole =
  (...roles: string[]): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(String(user.role_name))) {
      return c.json({ success: false, message: "Forbidden" }, 403);
    }
    await next();
  };