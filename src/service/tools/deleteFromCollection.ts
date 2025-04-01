import { ToolInputParams, ToolReturnParams } from '../../models/types.js'
import { updateInCollection } from '../../persistence/persistCollectionData.js'
import { getCollectionTypeByCollectionName } from '../../persistence/persistCollectionType.js'
import { ObjectId } from 'mongodb'
const deleteFromCollectionSchema = {
  name: 'delete_from_collection',
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
        description: "Must be either '_id' or 'id'",
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
 * @param params - Tool input parameters containing collection name, attribute, and value
 * @returns Tool return parameters with success/failure message and deletion count
 */
async function deleteFromCollection(params: ToolInputParams): Promise<ToolReturnParams> {
  console.log('deleteFromCollection', params)
  const { collection_name, attribute, value } = params.arguments ?? {}
  console.log({ collection_name, attribute, value })

  // Validate input parameters
  if (!collection_name || typeof collection_name !== 'string') {
    console.log('Invalid collection name:', collection_name)
    return {
      success: false,
      type: 'text',
      text: "'collection_name' must be present in the request params arguments"
    }
  }

  if (attribute !== '_id' && attribute !== 'id') {
    console.log('Invalid attribute:', attribute)
    return {
      success: false,
      type: 'text',
      text: "attribute must be either '_id' or 'id'"
    }
  }

  if (value === undefined || value === null) {
    console.log('Missing value for deletion')
    return {
      success: false,
      type: 'text',
      text: "'value' must be present in the request params arguments"
    }
  }

  try {
    // Check if collection exists
    const collectionType = await getCollectionTypeByCollectionName(collection_name)
    if (!collectionType) {
      console.log('Collection not found:', collection_name)
      return {
        success: false,
        type: 'text',
        text: `Collection '${collection_name}' does not exist`
      }
    }

    // Create query for exact match on attribute
    const query: Record<string, unknown> = {}
    query[attribute] = new ObjectId(value as string)

    // Use updateInCollection instead of deleteInCollection
    const result = await updateInCollection(collection_name, query, {
      deleted: true
    })

    return {
      success: true,
      type: 'text',
      text: `Successfully deleted ${result} document${result !== 1 ? 's' : ''} from collection '${collection_name}'`
    }
  } catch (error) {
    console.log('Error deleting from collection:', error)
    return {
      success: false,
      type: 'text',
      text: `Error deleting from collection: ${error}`
    }
  }
}

export { deleteFromCollection, deleteFromCollectionSchema }
