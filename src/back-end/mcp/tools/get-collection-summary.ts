import { getFormattedCollectionSummary } from '../../persistence/operations/find/summarize-collection.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'
export const getCollectionSummarySchema = {
  name: TOOL_NAME.COLLECTION_SUMMARY,
  description: [
    'Get a summary of all records in a collection, showing their IDs and summaries.',
    'When you have no idea about the contents of a collection, use this to get an',
    'overview instead of fetching individual records to find out. Always try to limit',
    'the number tokens used in your tasks.'
  ].join(' '),
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Name of the collection to summarize'
      }
    },
    required: ['collection_name']
  }
}

/**
 * Tool function to get a summary of all records in a collection
 * Returns a formatted string with ID and summary of each record
 *
 * @param request - Tool request containing collection name
 * @returns Tool return parameters with formatted summary text
 */
export async function getCollectionSummary(params: CallToolRequest['params']): Promise<CallToolResult> {
  console.log('getCollectionSummary', params)
  const { collection_name } = params.arguments ?? {}

  if (!collection_name || typeof collection_name !== 'string') {
    console.log('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  try {
    const summary = await getFormattedCollectionSummary(collection_name)

    return getToolsTextResponse(true, summary)
  } catch (error) {
    console.log('Error getting collection summary:', error)
    return getToolsTextResponse(false, `Error getting collection summary: ${error}`)
  }
}
