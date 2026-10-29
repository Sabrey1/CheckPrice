import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware, type AppEnv } from './middleware/auth'
import { apiIpRateLimiter, apiRateLimiter } from './middleware/rate-limit'

import { login } from './routes/auth'
import { Routercategory } from './routes/category'
import { Routerproduct } from './routes/product'
import { Routerbranch } from './routes/branch'
import { RouterRole } from './routes/role'
import { RouterUser } from './routes/users'

const app = new Hono<AppEnv>()

// Allow CORS
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'https://checkprice.sabrey.xyz'
    ],
  })
)

// Apply a shared IP limit to every API route, including login and unauthenticated requests.
app.use('/api/*', apiIpRateLimiter)

app.use('/api/*', async (c, next) => {
  if(c.req.path === '/api/login' || c.req.path === '/api/login/') {
    return next();
  }
  return authMiddleware(c, next);
})

// Limit authenticated API traffic per user. Login has its own limiter.
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/login' || c.req.path === '/api/login/') {
    return next();
  }
  return apiRateLimiter(c, next);
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/api/login', login)
app.route('/api/category', Routercategory)
app.route('/api/product', Routerproduct)
app.route('/api/branch', Routerbranch)
app.route('/api/role', RouterRole)
app.route('/api/user', RouterUser)

export default app
