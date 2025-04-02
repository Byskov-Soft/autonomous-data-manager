import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { getEnv } from './lib/env.js'
import { useResources } from './mcp/resources/index.js'
import { useTools } from './mcp/tools/index.js'
import { applyTransport } from './mcp/transports/index.js'

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
    // Enable capabilities
    capabilities: {
      resources: {},
      tools: {}
    }
  }
)

// Setup MCP resources and tools
useResources(server)
useTools(server)

// Start the server
applyTransport(server, getEnv().RUN_MODE)
