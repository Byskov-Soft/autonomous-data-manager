import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequest,
  CallToolRequestSchema,
  CallToolResult,
  ListToolsRequestSchema,
  Result
} from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'
import { addCollectionTypeSchema, addCollectionType } from './add-collection-type.js'
import { addBatchToCollectionSchema, addBatchToCollection } from './add-batch-to-collection.js'
import { deleteFromCollectionSchema, deleteFromCollection } from './delete-from-collection.js'
import { getCollectionSummarySchema, getCollectionSummary } from './get-collection-summary.js'
import { getFromCollectionSchema, getFromCollection } from './get-from-collection.js'
import { getResourceDataSchema, getResourceData } from './get-resource-data.js'

export const useTools = (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      addCollectionTypeSchema,
      // If you only want to add one document at a time
      // enable addToCollectionSchema and disable addBatchToCollectionSchema
      //addToCollectionSchema,
      addBatchToCollectionSchema,
      getFromCollectionSchema,
      deleteFromCollectionSchema,
      getCollectionSummarySchema,
      getResourceDataSchema
    ]
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    console.log('CallToolRequestSchema', request)
    let handler: (input: CallToolRequest['params']) => Promise<CallToolResult>

    switch (request.params.name) {
      case TOOL_NAME.ADD_COLLECTION_TYPE:
        handler = addCollectionType
        break

      // If you only want to add one document at a time
      // enable TOOL_NAME.ADD_TO_COLLECTION and disable TOOL_NAME.ADD_BATCH_TO_COLLECTION
      // case TOOL_NAME.ADD_TO_COLLECTION:
      //   handler = addToCollection
      //   break

      case TOOL_NAME.ADD_BATCH_TO_COLLECTION:
        handler = addBatchToCollection
        break

      case TOOL_NAME.GET_FROM_COLLECTION:
        handler = getFromCollection
        break

      case TOOL_NAME.DELETE_FROM_COLLECTION:
        handler = deleteFromCollection
        break

      case TOOL_NAME.COLLECTION_SUMMARY:
        handler = getCollectionSummary
        break

      case TOOL_NAME.GET_RESOURCE_DATA:
        handler = getResourceData
        break

      default:
        throw new Error('Tool not found')
    }

    return handler(request.params)
  })
}
