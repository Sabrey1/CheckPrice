import { Hono } from 'hono'

import { Routercategory } from './routes/category'
import { Routerbranch } from './routes/branch'
import { login } from './routes/auth'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/api/login', login)
app.route('/api/category', Routercategory)
app.route('/api/branch', Routerbranch)

export default app
