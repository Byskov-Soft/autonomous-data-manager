import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ObjectId } from 'mongodb'
import { getToolsTextResponse } from '../../lib/utils.js'
import { TOOL_NAME } from '../../models/enums.js'
import { updateInCollection } from '../../persistence/CollectionDataPersistence.js'
import { getCollectionTypeByCollectionName } from '../../persistence/CollectionTypePersistence.js'

export const deleteFromCollectionSchema = {
  name: TOOL_NAME.DELETE_FROM_COLLECTION,
  description: "Delete documents from a collection by matching either MongoDB's _id or a custom id field",
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Name of the collection to delete documents from'
      },
      attribute: {
        type: 'string',
        description: "Must be either '_id' or 'id' (if 'id' is present on the schema)",
        enum: ['_id', 'id']
      },
      value: {
        type: 'string',
        description: 'Value of the _id or id to match for deletion'
      }
    },
    required: ['collection_name', 'attribute', 'value']
  }
}

/**
 * Tool function to delete documents from a collection based on an exact attribute match
 * @param request - Tool request containing collection name, attribute, and value
 * @returns Tool return parameters with success/failure message and deletion count
 */
export async function deleteFromCollection(params: CallToolRequest['params']): Promise<CallToolResult> {
  console.log('deleteFromCollection', params)
  const { collection_name, attribute, value } = params.arguments ?? {}
  console.log({ collection_name, attribute, value })

  // Validate input parameters
  if (!collection_name || typeof collection_name !== 'string') {
    console.log('Invalid collection name:', collection_name)
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  if (attribute !== '_id' && attribute !== 'id') {
    console.log('Invalid attribute:', attribute)
    return getToolsTextResponse(false, "attribute must be either '_id' or 'id'")
  }

  if (value === undefined || value === null) {
    console.log('Missing value for deletion')
    return getToolsTextResponse(false, "'value' must be present in the request params arguments")
  }

  try {
    // Check if collection exists
    const collectionType = await getCollectionTypeByCollectionName(collection_name)
    if (!collectionType) {
      console.log('Collection not found:', collection_name)
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
    console.log('Error deleting from collection:', error)
    return getToolsTextResponse(false, `Error deleting from collection: ${error}`)
  }
}
