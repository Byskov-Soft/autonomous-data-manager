import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ReadResourceResult
} from '@modelcontextprotocol/sdk/types.js'
import { collectionsResourceSchema } from './collections.js'
import {
  getServerDescription,
  readCollectionsInfo,
  serverDescriptionResourceSchema
} from './server-description.js'

export const useResources = (server: Server) => {
  server.setRequestHandler(ListResourcesRequestSchema, () => ({
    resources: [collectionsResourceSchema, serverDescriptionResourceSchema]
  }))

  server.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<ReadResourceResult> => {
    switch (request.params.uri) {
      case 'data://server-description':
        console.log('Server description requested')
        return getServerDescription()

      case 'data://collections':
        console.log('Collections info requested')
        return readCollectionsInfo()

      default:
        console.log('Resource not found')
        return { contents: [] }
    }
  })
}
