import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { projectRoutes } from './routes/projects'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: (origin, c) => (origin === c.env.FRONTEND_ORIGIN ? origin : undefined),
    credentials: true,
    allowHeaders: ['Content-Type'],
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api/auth', authRoutes)
app.route('/api/projects', projectRoutes)

app.notFound((c) => c.json({ error: 'Não encontrado.' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Erro interno do servidor.' }, 500)
})

export default app
