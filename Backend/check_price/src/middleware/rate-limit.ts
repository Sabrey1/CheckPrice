import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth";

const WINDOW_SECONDS = 10;

function clientIp(c: Context<AppEnv>) {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function rateLimited(c: Context<AppEnv>, message: string) {
  c.header("Retry-After", String(WINDOW_SECONDS));
  return c.json({ success: false, message }, 429);
}

export const loginRateLimiter: MiddlewareHandler<AppEnv> = async (c, next) => {
  const limiter = c.env.LOGIN_RATE_LIMIT;

  // Fail closed: don't silently disable login protection if the binding is missing.
  if (!limiter) {
    console.error("LOGIN_RATE_LIMIT binding is missing");
    return c.json({ success: false, message: "Internal server error" }, 500);
  }

  // Read the username for the per-account limit. Hono caches the body, so the
  // login route can call c.req.json() again safely.
  let username = "";
  try {
    const body = await c.req.json();
    if (typeof body?.username === "string") {
      username = body.username.trim().toLowerCase();
    }
  } catch {
    // Invalid JSON: the route will reject it. The IP limit still applies.
  }

  const checks = [limiter.limit({ key: `login:ip:${clientIp(c)}` })];
  if (username) {
    checks.push(limiter.limit({ key: `login:user:${username}` }));
  }

  const results = await Promise.all(checks);

  if (results.some((result) => !result.success)) {
    return rateLimited(c, "Too many login attempts. Please try again later.");
  }

  await next();
};

export const apiRateLimiter: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userLimiter = c.env.API_RATE_LIMIT;
  const roleLimiter = c.env.API_ROLE_RATE_LIMIT;
  const branchLimiter = c.env.API_BRANCH_RATE_LIMIT;

  // Fail closed: don't silently disable API protection if a binding is missing.
  if (!userLimiter || !roleLimiter || !branchLimiter) {
    console.error("API rate limit binding is missing");
    return c.json({ success: false, message: "Internal server error" }, 500);
  }

  // Auth runs before this middleware, so we can limit per user, role, and branch.
  const user = c.get("user");
  const checks: Promise<RateLimitOutcome>[] = [];

  if (user?.sub) {
    checks.push(userLimiter.limit({ key: `api:user:${user.sub}` }));
  }
  if (user?.role_id != null) {
    checks.push(roleLimiter.limit({ key: `api:role:${user.role_id}` }));
  }
  if (user?.branch_id != null) {
    checks.push(branchLimiter.limit({ key: `api:branch:${user.branch_id}` }));
  }

  // Should not happen after authMiddleware, but keep a safe fallback.
  if (checks.length === 0) {
    checks.push(userLimiter.limit({ key: `api:ip:${clientIp(c)}` }));
  }

  const results = await Promise.all(checks);

  if (results.some((result) => !result.success)) {
    return rateLimited(c, "Too many requests. Please try again later.");
  }

  await next();
};
