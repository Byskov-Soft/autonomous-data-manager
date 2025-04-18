import { queryCollection } from '../../persistence/index.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { useLogger } from '../../lib/logger.js'

/**
 * Tool function to retrieve documents from a collection with filtering capabilities
 * @param request - Tool request containing query details
 * @returns Tool return parameters with results or count
 */
export async function getFromCollection(params: CallToolRequest['params']): Promise<CallToolResult> {
  const log = useLogger()
  log.info('getFromCollection', params)
  const { collection_name, type, attribute, value, range = 30 } = params.arguments ?? {}

  // Validate input parameters
  if (!collection_name || typeof collection_name !== 'string') {
    log.error('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  if (!type || typeof type !== 'string' || !['value', 'value_exact', 'range', 'count'].includes(type)) {
    log.error('Invalid query type:', type)
    return getToolsTextResponse(false, "'type' must be one of: 'value', 'value_exact', 'range', or 'count'")
  }

  // Validate attribute and value for type=value or type=value_exact
  if ((type === 'value' || type === 'value_exact') && (!attribute || typeof attribute !== 'string')) {
    log.error('Missing attribute for value query')
    return getToolsTextResponse(false, "'attribute' is required when type is 'value' or 'value_exact'")
  }

  if ((type === 'value' || type === 'value_exact') && (value === undefined || value === null)) {
    log.error('Missing value for value query')
    return getToolsTextResponse(false, "'value' is required when type is 'value' or 'value_exact'")
  }

  try {
    // Query the database based on type
    const results = await queryCollection({
      collectionName: collection_name,
      queryType: type,
      attribute: attribute as string | undefined,
      value: value as string,
      limit: Math.min(Number(range) || 30, 30)
    })

    // Return appropriate response based on query type
    if (type === 'count') {
      log.info('results', { count: results.count || 0 })
      return getToolsTextResponse(true, JSON.stringify({ count: results.count || 0 }))
    } else {
      log.info('results', results)
      return getToolsTextResponse(true, JSON.stringify(results.records || []))
    }
  } catch (error) {
    log.error('Error retrieving from collection:', error)
    return getToolsTextResponse(false, `Error retrieving from collection: ${error}`)
  }
}
