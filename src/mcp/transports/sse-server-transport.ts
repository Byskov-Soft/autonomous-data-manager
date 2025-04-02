import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'
import { getEnv } from '../../lib/env.js'

export const useSseServerTransport = (server: Server) => {
  console.log(`Starting server in SSE mode`)
  const env = getEnv()
  const app = express()
  const activeTransports: { [sessionId: string]: SSEServerTransport } = {}

  // Configure keep-alive interval (15 seconds)
  const KEEP_ALIVE_INTERVAL = 15000

  app.get('/sse', async (req, res) => {
    console.log('SSE Request received')

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable response buffering

    // Increase timeout to 24 hours
    req.socket.setTimeout(24 * 60 * 60 * 1000)

    const transport = new SSEServerTransport('/messages', res)
    const sessionId = transport.sessionId
    activeTransports[sessionId] = transport

    console.log(`SSE Client ${sessionId} connected`)
    console.log('Number of SSE clients connected:', Object.keys(activeTransports).length)

    // Set up keep-alive interval
    const keepAliveInterval = setInterval(() => {
      if (res.writableEnded) {
        clearInterval(keepAliveInterval)
        return
      }
      res.write('event: keep-alive\ndata: ping\n\n')
    }, KEEP_ALIVE_INTERVAL)

    await server.connect(transport)

    res.on('close', () => {
      console.log(`SSE Client ${sessionId} disconnected`)
      clearInterval(keepAliveInterval)
      delete activeTransports[sessionId]
    })

    // Handle errors
    res.on('error', (error) => {
      console.error(`SSE Client ${sessionId} error:`, error)
      clearInterval(keepAliveInterval)
      delete activeTransports[sessionId]
    })
  })

  app.post('/messages', (req, res) => {
    console.log(`/message Request received`)
    const sessionId = req.query.sessionId as string // Extract from query
    console.log(`Session ID: ${sessionId}`)
    const transport = activeTransports[sessionId]

    if (transport) {
      transport.handlePostMessage(req, res)
    } else {
      res.status(404).json({ error: 'No active SSE connection for this session' })
    }
  })

  app.listen(env.SSE_MODE_PORT, env.SSE_MODE_HOST, () => {
    console.log(`Server is running on http://${env.SSE_MODE_HOST}:${env.SSE_MODE_PORT}`)
  })
}
