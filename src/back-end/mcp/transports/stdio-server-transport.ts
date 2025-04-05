import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export const useStdioServerTransport = (server: Server) => {
  console.log('Starting server in commandline (stdio) mode')
  const transport = new StdioServerTransport()
  server.connect(transport)
}
