import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite'
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

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/
const GSC_TOKEN_PATTERN = /^[A-Za-z0-9_-]{10,100}$/

/**
 * Injects Google Analytics 4 and the Search Console verification meta tag into
 * index.html (and therefore every prerendered page) at build time. Each tag is
 * only emitted when its env var is set to a well-formed value.
 */
function siteTagsPlugin(env: Record<string, string>): Plugin {
  const gaId = (env.VITE_GA_MEASUREMENT_ID || '').trim()
  // Accept either the bare token or the full <meta ... content="..."> snippet.
  const gscRaw = (env.VITE_GSC_VERIFICATION || '').trim()
  const gscToken = gscRaw.match(/content=["']([^"']+)["']/)?.[1] ?? gscRaw

  return {
    name: 'site-tags',
    apply: 'build',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = []

      if (gscToken) {
        if (GSC_TOKEN_PATTERN.test(gscToken)) {
          tags.push({
            tag: 'meta',
            attrs: { name: 'google-site-verification', content: gscToken },
            injectTo: 'head',
          })
        } else {
          console.warn('[site-tags] VITE_GSC_VERIFICATION is not a valid token; skipped')
        }
      }

      if (gaId) {
        if (GA_ID_PATTERN.test(gaId)) {
          tags.push(
            {
              tag: 'script',
              attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${gaId}` },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              injectTo: 'head',
            },
          )
        } else {
          console.warn('[site-tags] VITE_GA_MEASUREMENT_ID must look like G-XXXXXXXXXX; skipped')
        }
      }

      return tags
    },
  }
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), contactApiPlugin(env), siteTagsPlugin(env)],
    build: {
      copyPublicDir: !isSsrBuild,
    },
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
