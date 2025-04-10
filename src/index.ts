import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { Express } from 'express'
import { getEnv } from './back-end/lib/env.js'
import { useResources } from './back-end/mcp/resources/index.js'
import { useTools } from './back-end/mcp/tools/index.js'
import { useSseServerTransport } from './back-end/mcp/transports/sse-server-transport.js'
import { useStdioServerTransport } from './back-end/mcp/transports/stdio-server-transport.js'
import { SERVER_MODE } from './back-end/models/enums.js'
import { applyApi } from './back-end/api/index.js'
import { serveExpressApp } from './back-end/lib/express-app.js'

const { RUN_MODE, SSE_MODE_HOST, SSE_MODE_PORT } = getEnv()

// Initialize server
const server = new Server(
  {
    name: 'ai-autonomous-data-manager',
    version: '0.1.0',
    description:
      'Data collection manager for persisting and organizing information across conversations.' +
      'Consider saving useful information for future reference.'
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
)

// Setup MCP resources and tools
useResources(server)
useTools(server)

if (RUN_MODE === SERVER_MODE.SSE) {
  // SSE events (HTTP streaming)
  const applyRoutes = (app: Express) => {
    applyApi(app)
    useSseServerTransport(server, app)
  }

  const streamingUris = ['/sse', '/messages']
  serveExpressApp(SSE_MODE_HOST, SSE_MODE_PORT, applyRoutes, streamingUris)
} else {
  // STDIO (streaming from/to stdin and stdout)
  useStdioServerTransport(server)
}
