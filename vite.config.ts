import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import {
  readJsonBody,
  sendContactEmail,
} from './server/sendContactEmail.js'

function contactApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'contact-api',
    configureServer(server) {
      if (env.RESEND_API_KEY) process.env.RESEND_API_KEY = env.RESEND_API_KEY
      if (env.RESEND_FROM) process.env.RESEND_FROM = env.RESEND_FROM
      if (env.CONTACT_TO) process.env.CONTACT_TO = env.CONTACT_TO

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/contact')) return next()
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const body = (await readJsonBody(req)) as Record<string, unknown>
          const result = await sendContactEmail({
            name: String(body.name || ''),
            email: String(body.email || ''),
            company: String(body.company || ''),
            message: String(body.message || ''),
          })

          res.statusCode = result.ok ? 200 : result.status || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify(
              result.ok ? { ok: true, id: result.id } : { error: result.error },
            ),
          )
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Server error',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), contactApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3010,
      strictPort: true,
      host: '127.0.0.1',
      open: true,
    },
  }
})
