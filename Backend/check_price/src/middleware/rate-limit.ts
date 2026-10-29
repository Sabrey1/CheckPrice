import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth";

const WINDOW_SECONDS = 60;
const MAX_VIOLATIONS = 5; // Permanent ban after 5 violations
const VIOLATION_EXPIRY_DAYS = 7; // Reset count after 7 days of good behavior

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

async function checkPermanentBan(c: Context<AppEnv>, ip: string): Promise<boolean> {
  const banList = c.env.IP_BAN_LIST;
  if (!banList) {
    console.warn("IP_BAN_LIST binding is missing - permanent bans disabled");
    return false;
  }

  const banRecord = await banList.get(`ban:${ip}`);
  if (banRecord) {
    const data = JSON.parse(banRecord);
    return data.permanent === true;
  }
  return false;
}

async function trackViolation(c: Context<AppEnv>, ip: string) {
  const banList = c.env.IP_BAN_LIST;
  if (!banList) {
    return;
  }

  const key = `violations:${ip}`;
  const existing = await banList.get(key);

  let violations = 1;
  if (existing) {
    const data = JSON.parse(existing);
    violations = data.count + 1;
  }

  // Permanent ban after MAX_VIOLATIONS
  if (violations >= MAX_VIOLATIONS) {
    await banList.put(
      `ban:${ip}`,
      JSON.stringify({
        permanent: true,
        violations: violations,
        banned_at: new Date().toISOString(),
        reason: "Exceeded maximum rate-limit violations"
      })
    );
    console.log(`PERMANENT BAN: IP ${ip} banned after ${violations} violations`);
  } else {
    // Track violation count (expires after 7 days)
    const expirySeconds = VIOLATION_EXPIRY_DAYS * 24 * 60 * 60;
    await banList.put(
      key,
      JSON.stringify({ count: violations, last: new Date().toISOString() }),
      { expirationTtl: expirySeconds }
    );
    console.log(`VIOLATION: IP ${ip} - ${violations}/${MAX_VIOLATIONS}`);
  }
}

export const loginRateLimiter: MiddlewareHandler<AppEnv> = async (c, next) => {
  const ip = clientIp(c);

  // Check permanent ban first
  const isPermanentlyBanned = await checkPermanentBan(c, ip);
  if (isPermanentlyBanned) {
    return c.json(
      {
        success: false,
        message: "Your IP address has been permanently banned due to repeated violations. Contact support if you believe this is an error."
      },
      403
    );
  }

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

  const checks = [limiter.limit({ key: `login:ip:${ip}` })];
  if (username) {
    checks.push(limiter.limit({ key: `login:user:${username}` }));
  }

  const results = await Promise.all(checks);

  if (results.some((result) => !result.success)) {
    // Track violation for this IP
    await trackViolation(c, ip);

    return rateLimited(c, "Too many login attempts. Please try again later.");
  }

  await next();
};

export const apiIpRateLimiter: MiddlewareHandler<AppEnv> = async (c, next) => {
  const ip = clientIp(c);

  if (await checkPermanentBan(c, ip)) {
    return c.json({ success: false, message: "IP blocked" }, 403);
  }

  const limiter = c.env.API_RATE_LIMIT;

  if (!limiter) {
    console.error("API_RATE_LIMIT binding is missing");
    return c.json({ success: false, message: "Internal server error" }, 500);
  }

  const result = await limiter.limit({ key: `api:ip:${ip}` });
  if (!result.success) {
    await trackViolation(c, ip);
    return c.json({ success: false, message: "IP blocked" }, 403);
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
    await trackViolation(c, clientIp(c));
    return c.json({ success: false, message: "IP blocked" }, 403);
  }

  await next();
};
