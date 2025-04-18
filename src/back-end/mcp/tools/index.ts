import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequest,
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  Result
} from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'
import { addCollectionType } from './add-collection-type.js'
import { addBatchToCollection } from './add-batch-to-collection.js'
import { deleteFromCollection } from './delete-from-collection.js'
import { getCollectionSummary } from './get-collection-summary.js'
import { getFromCollection } from './get-from-collection.js'
import { getResourceData } from './get-resource-data.js'
import { getToolListSchema, loadToolsSchema } from '../../lib/mcp-schema.js'
import { useLogger } from '../../lib/logger.js'

type RequetHandler = (input: CallToolRequest['params']) => Promise<CallToolResult>
const schemaFile = `${import.meta.dirname}/_tools-schema.yml`

export const useTools = async (server: Server) => {
  const log = useLogger()
  await loadToolsSchema(schemaFile)

  // List tools requests
  const tools: Result[] = await Promise.all([
    getToolListSchema(TOOL_NAME.ADD_COLLECTION_TYPE),
    getToolListSchema(TOOL_NAME.ADD_BATCH_TO_COLLECTION),
    getToolListSchema(TOOL_NAME.GET_FROM_COLLECTION),
    getToolListSchema(TOOL_NAME.DELETE_FROM_COLLECTION),
    getToolListSchema(TOOL_NAME.GET_COLLECTION_SUMMARY),
    getToolListSchema(TOOL_NAME.GET_RESOURCE_DATA)
  ])

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }))

  // Call tools requests
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    log.info('CallToolRequestSchema', request)

    switch (request.params.name.toLowerCase()) {
      case TOOL_NAME.ADD_COLLECTION_TYPE:
        return addCollectionType(request.params)
      case TOOL_NAME.ADD_BATCH_TO_COLLECTION:
        return addBatchToCollection(request.params)
      case TOOL_NAME.GET_FROM_COLLECTION:
        return getFromCollection(request.params)
      case TOOL_NAME.DELETE_FROM_COLLECTION:
        return deleteFromCollection(request.params)
      case TOOL_NAME.GET_COLLECTION_SUMMARY:
        return getCollectionSummary(request.params)
      case TOOL_NAME.GET_RESOURCE_DATA:
        return getResourceData(request.params)
      default:
        throw new Error(`Tool "${request.params.name}" not found`)
    }
  })
}
