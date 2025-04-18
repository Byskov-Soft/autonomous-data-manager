import { getFormattedCollectionSummary } from '../../persistence/operations/find/summarize-collection.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { useLogger } from '../../lib/logger.js'

/**
 * Tool function to get a summary of all records in a collection
 * Returns a formatted string with ID and summary of each record
 *
 * @param request - Tool request containing collection name
 * @returns Tool return parameters with formatted summary text
 */
export async function getCollectionSummary(params: CallToolRequest['params']): Promise<CallToolResult> {
  const log = useLogger()
  log.info('getCollectionSummary', params)
  const { collection_name } = params.arguments ?? {}

  if (!collection_name || typeof collection_name !== 'string') {
    log.error('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  try {
    const summary = await getFormattedCollectionSummary(collection_name)

    return getToolsTextResponse(true, summary)
  } catch (error) {
    log.error('Error getting collection summary:', error)
    return getToolsTextResponse(false, `Error getting collection summary: ${error}`)
  }
}
