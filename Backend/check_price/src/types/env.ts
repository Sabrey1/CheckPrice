export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  LOGIN_RATE_LIMIT: RateLimit;
  API_RATE_LIMIT: RateLimit;
  API_ROLE_RATE_LIMIT: RateLimit;
  API_BRANCH_RATE_LIMIT: RateLimit;
}