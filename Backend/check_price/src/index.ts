import { Hono } from 'hono'
import { cors } from 'hono/cors'


import { login } from './routes/auth'
import { Routercategory } from './routes/category'
import { Routerproduct } from './routes/product'
import { Routerbranch } from './routes/branch'
import { RouterRole } from './routes/role'
import { RouterUser } from './routes/users'


const app = new Hono()

// Allow CORS
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ],
  })
)

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
