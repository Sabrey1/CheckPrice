import { Hono } from 'hono'
import { cors } from 'hono/cors'



import { Routercategory } from './routes/category'
import { Routerbranch } from './routes/branch'
import { login } from './routes/auth'

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
app.route('/api/branch', Routerbranch)

export default app
