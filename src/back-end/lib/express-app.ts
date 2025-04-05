import express, { ErrorRequestHandler, Express } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const serveExpressApp = (
  host: string,
  port: number,
  applyRoutes?: (app: Express) => void,
  streamingUris: string[] = []
) => {
  const app = express()

  // Get the public directory path - in production it will be in dist/public
  const publicDir = path.join(__dirname, '..', '..', '..', 'dist', 'public')
  console.log('Serving static files from:', publicDir)

  // Serve static files from the dist/public directory
  app.use(express.static(publicDir))

  if (applyRoutes) {
    applyRoutes(app)
  }

  // Create regex pattern that excludes streaming URIs from JSON middleware
  const nonStreamingPattern =
    streamingUris.length > 0
      ? new RegExp(`^(?!${streamingUris.map((uri) => uri.replace('/', '\\/')).join('|')})`)
      : /.*/

  // Add JSON middleware with strict parsing AFTER streaming routes
  app.use(
    nonStreamingPattern,
    express.json({
      strict: true,
      limit: '1mb'
    })
  )
  app.use(nonStreamingPattern, express.urlencoded({ extended: true }))

  // Serve index.html for all non-API routes to support client-side routing
  const indexHtml = path.join(publicDir, 'index.html')
  console.log('Serving index.html from:', indexHtml)

  app.get(/^(?!\/api\/).+/, (req, res) => {
    res.sendFile(indexHtml)
  })

  // Error handling middleware
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error('Error:', err)

    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json')

    // Handle different error types
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON payload' })
    } else {
      res.status(500).json({
        error:
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error'
      })
    }
  }

  app.use(errorHandler)

  app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
  })
}
