import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'resend-dev-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/newsletter/send' && req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body || '{}')
                  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY
                  if (!apiKey) {
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in .env' }))
                    return
                  }
                  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to]
                  const sender = payload.from || env.RESEND_FROM_EMAIL || 'OfficeAIM <onboarding@resend.dev>'

                  const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      from: sender,
                      to: recipients,
                      subject: payload.subject,
                      html: payload.html || undefined,
                      text: payload.text || undefined
                    })
                  })
                  const data = await resendRes.json()
                  res.statusCode = resendRes.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                } catch (err) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err.message }))
                }
              })
              return
            }
            next()
          })
        }
      }
    ],
    base: '/hub',
    server: {
      host: '0.0.0.0',
      port: 5173,
      cors: true
    }
  }
})
