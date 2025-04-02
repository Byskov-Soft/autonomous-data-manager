import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { useSseServerTransport } from './sse-server-transport.js'
import { useStdioServerTransport } from './stdio-server-transport.js'
import { RUN_MODE } from '../../models/enums.js'

export const applyTransport = (server: Server, runMode: string) => {
  if (runMode === RUN_MODE.SSE) {
    useSseServerTransport(server)
  } else {
    useStdioServerTransport(server)
  }
}
