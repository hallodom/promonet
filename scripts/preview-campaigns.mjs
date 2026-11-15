import { createServer } from 'vite'

const server = await createServer({ server: { open: false } })
await server.listen()
server.printUrls()
console.log('Campaign previews: /ai-ready and /connect-your-tools')
