import { CallToolRequest, CallToolResult, Result } from '@modelcontextprotocol/sdk/types.js'
import { ObjectId } from 'mongodb'
import { getToolsTextResponse } from '../../lib/utils.js'
import { updateInCollection } from '../../persistence/index.js'
import { getCollectionTypeByCollectionName } from '../../persistence/collection-types.js'
import { useLogger } from '../../lib/logger.js'
/**
 * Tool function to delete documents from a collection based on an exact attribute match
 * @param request - Tool request containing collection name, attribute, and value
 * @returns Tool return parameters with success/failure message and deletion count
 */
export async function deleteFromCollection(params: CallToolRequest['params']): Promise<CallToolResult> {
  const log = useLogger()
  log.info('deleteFromCollection', params)
  const { collection_name, attribute, value } = params.arguments ?? {}
  log.info({ collection_name, attribute, value })

  // Validate input parameters
  if (!collection_name || typeof collection_name !== 'string') {
    log.error('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  if (attribute !== '_id' && attribute !== 'id') {
    log.error('Invalid attribute:', attribute)
    return getToolsTextResponse(false, "attribute must be either '_id' or 'id'")
  }

  if (value === undefined || value === null) {
    log.error('Missing value for deletion')
    return getToolsTextResponse(false, "'value' must be present in the request params arguments")
  }

  try {
    // Check if collection exists
    const collectionType = await getCollectionTypeByCollectionName(collection_name)
    if (!collectionType) {
      log.error('Collection not found:', collection_name)
      return getToolsTextResponse(false, `Collection '${collection_name}' does not exist`)
    }

    // Create query for exact match on attribute
    const query: Record<string, unknown> = {}
    query[attribute] = attribute === '_id' ? new ObjectId(value as string) : value

    // Use updateInCollection instead of deleteInCollection
    const result = await updateInCollection(collection_name, query, {
      deleted: true
    })

    return getToolsTextResponse(
      true,
      `Successfully deleted ${result} document${result !== 1 ? 's' : ''} from collection '${collection_name}'`
    )
  } catch (error) {
    log.error('Error deleting from collection:', error)
    return getToolsTextResponse(false, `Error deleting from collection: ${error}`)
  }
}
