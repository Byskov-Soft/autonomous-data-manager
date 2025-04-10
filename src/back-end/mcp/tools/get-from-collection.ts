import { queryCollection } from '../../persistence/index.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'
export const getFromCollectionSchema = {
  name: TOOL_NAME.GET_FROM_COLLECTION,
  description: 'Retrieve documents from a collection with filtering capabilities',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Name of the collection to retrieve documents from'
      },
      type: {
        type: 'string',
        enum: ['value', 'value_exact', 'range', 'count'],
        description:
          'Type of query to perform: value (loose match), value_exact (exact match), range (get latest n records), or count (get total count)'
      },
      attribute: {
        type: 'string',
        description: "Name of the attribute to filter on (required if type is 'value' or 'value_exact')"
      },
      value: {
        type: 'string',
        description:
          "Value to match against the specified attribute (required if type is 'value' or 'value_exact')"
      },
      range: {
        type: 'number',
        description: "Number of recent records to retrieve (used when type is 'range')",
        default: 30
      }
    },
    required: ['collection_name', 'type']
  }
}

/**
 * Tool function to retrieve documents from a collection with filtering capabilities
 * @param request - Tool request containing query details
 * @returns Tool return parameters with results or count
 */
export async function getFromCollection(params: CallToolRequest['params']): Promise<CallToolResult> {
  console.log('getFromCollection', params)
  const { collection_name, type, attribute, value, range = 30 } = params.arguments ?? {}

  // Validate input parameters
  if (!collection_name || typeof collection_name !== 'string') {
    console.log('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  if (!type || typeof type !== 'string' || !['value', 'value_exact', 'range', 'count'].includes(type)) {
    console.log('Invalid query type:', type)
    return getToolsTextResponse(false, "'type' must be one of: 'value', 'value_exact', 'range', or 'count'")
  }

  // Validate attribute and value for type=value or type=value_exact
  if ((type === 'value' || type === 'value_exact') && (!attribute || typeof attribute !== 'string')) {
    console.log('Missing attribute for value query')
    return getToolsTextResponse(false, "'attribute' is required when type is 'value' or 'value_exact'")
  }

  if ((type === 'value' || type === 'value_exact') && (value === undefined || value === null)) {
    console.log('Missing value for value query')
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
      console.log('results', { count: results.count || 0 })
      return getToolsTextResponse(true, JSON.stringify({ count: results.count || 0 }))
    } else {
      console.log('results', results)
      return getToolsTextResponse(true, JSON.stringify(results.records || []))
    }
  } catch (error) {
    console.log('Error retrieving from collection:', error)
    return getToolsTextResponse(false, `Error retrieving from collection: ${error}`)
  }
}
