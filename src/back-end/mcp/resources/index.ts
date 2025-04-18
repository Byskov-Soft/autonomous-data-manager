import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ReadResourceResult,
  Resource
} from '@modelcontextprotocol/sdk/types.js'
import { readCollectionsResource } from './collections.js'
import { getServerDescription } from './server-description.js'
import { RESOURCE_NAME } from '../../models/enums.js'
import { getResourceListSchema, loadResourcesSchema } from '../../lib/mcp-schema.js'

const schemaFile = `${import.meta.dirname}/_resources-schema.yml`

export const useResources = async (server: Server) => {
  await loadResourcesSchema(schemaFile)

  // List resources requests
  const resources: Resource[] = await Promise.all([
    getResourceListSchema(RESOURCE_NAME.COLLECTIONS),
    getResourceListSchema(RESOURCE_NAME.SERVER_DESCRIPTION)
  ])

  server.setRequestHandler(ListResourcesRequestSchema, () => ({ resources }))

  // Call resources requests
  server.setRequestHandler(ReadResourceRequestSchema, async (request): Promise<ReadResourceResult> => {
    let handler: () => Promise<ReadResourceResult>

    switch (request.params.uri) {
      case `data://${RESOURCE_NAME.SERVER_DESCRIPTION}`:
        return getServerDescription()
      case `data://${RESOURCE_NAME.COLLECTIONS}`:
        return readCollectionsResource()
      default:
        throw new Error(`Resource "${request.params.uri}" not found`)
    }
  })
}
