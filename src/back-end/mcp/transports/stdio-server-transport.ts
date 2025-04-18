import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { useLogger } from '../../lib/logger.js'

export const useStdioServerTransport = (server: Server) => {
  useLogger().info('Starting server in commandline (stdio) mode')
  const transport = new StdioServerTransport()
  server.connect(transport)
}
