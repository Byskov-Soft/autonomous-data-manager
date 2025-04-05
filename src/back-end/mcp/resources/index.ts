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
    let handler: () => Promise<ReadResourceResult>

    switch (request.params.uri) {
      case 'data://server-description':
        handler = getServerDescription
        break

      case 'data://collections':
        handler = readCollectionsInfo
        break

      default:
        throw new Error('Tool not found')
    }

    return handler()
  })
}
