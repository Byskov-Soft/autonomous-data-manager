import { createCollectionType } from '../../persistence/persistCollectionType.js'
import { CollectionType } from '../../models/entities.js'
import { ToolInputParams, ToolReturnParams } from '../../models/types.js'
import { transformStringToJson } from '../../utils.js'
import { getDynamicCollection } from '../../persistence/persistCollectionData.js'
import { z } from 'zod'

const COLLECTION_TYPE_TOOL_DESCRIPTION = [
  'Add a collection type to the database. This allows the AI to define a collection',
  '(using a schema), that will be automatically created, and perform CRUD operations',
  'on that collection.'
].join(' ')

const COLLECTION_TYPE_PARAM_DESCRIPTION = [
  'Add a collection type to the database with a defined schema.',
  "The 'collection' parameter must be a JSON string (not an object)",
  'containing the collection definition with:',
  'id, name, collection_name, description, and schema properties.',
  'The schema property should follow JSON Schema format with type, properties, and required fields.',
  'The schema properties must include a "summary" field of type string.',
  'Example: {"collection": "{"id":"products","name":"Products","collection_name":"products",',
  '"schema":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},',
  '"summary":{"type":"string"}},"required":["id","name","summary"]}}}'
].join(' ')

const COLLECTION_TYPE_EXAMPLE_RECORD = `
{
  "id": "products",
  "name": "Products",
  "collection_name": "products",
  "description": "Store product information",
  "schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "summary": {
        "type": "string",
        "description": "A concise description of the topic and conclusion"
      },
      "name": { "type": "string" },
      "price": { "type": "number" },
      "description": { "type": "string" },
      "inStock": { "type": "boolean" }
    },
    "required": ["id", "name", "price", "summary"]
  }
}
`

export const addCollectionTypeSchema = {
  name: 'add_collection_type',
  description: COLLECTION_TYPE_TOOL_DESCRIPTION,
  inputSchema: {
    type: 'object',
    properties: {
      collection: {
        type: 'string',
        description: COLLECTION_TYPE_PARAM_DESCRIPTION,
        examples: [COLLECTION_TYPE_EXAMPLE_RECORD]
      }
    },
    required: ['collection']
  }
}

/**
 * Tool function to add a new collection to the database
 * This function is used with the CallToolRequestSchema MCP handler
 *
 * @param collectionData - JSON string containing the collection data
 * @returns Object with success message and created collection details
 */
export async function addCollectionType(params: ToolInputParams): Promise<ToolReturnParams> {
  console.log('Adding collection type:', params)
  let collection: string
  let jsonCollection: Record<string, unknown>
  let collectionType: CollectionType

  // Resolve the input parameters
  try {
    collection = z.string().min(1).parse(params?.arguments?.collection)
  } catch {
    return {
      success: false,
      type: 'text',
      text: "'collection' must be present in the request params arguments"
    }
  }

  // Parse the collection data from JSON string to JSON object
  console.log('Parsing collection data:', collection)

  try {
    jsonCollection = transformStringToJson(collection)
  } catch (error) {
    return {
      success: false,
      type: 'text',
      text: `Invalid JSON in document: ${(error as Error)?.message ?? 'Unknown error'}`
    }
  }

  // Validate the collection schema
  try {
    collectionType = CollectionType.parse(jsonCollection)
  } catch {
    return {
      success: false,
      type: 'text',
      text: "collectionType is invalid. Did you remember to include a 'summary' field of type string?"
    }
  }

  // Insert the collection type into the database
  const newCollection: Omit<CollectionType, 'created_at' | 'updated_at'> = {
    id: collectionType.id,
    name: collectionType.name,
    collection_name: collectionType.collection_name,
    description: collectionType.description || '',
    schema: collectionType.schema
  }

  console.log('Creating new collection type:', newCollection)

  try {
    const mongoCollection = await getDynamicCollection(newCollection.collection_name)
    // Create an index on the 'deleted' field if it doesn't exist
    await mongoCollection.createIndex({ deleted: 1 }, { sparse: true })

    await createCollectionType(newCollection)

    return {
      success: true,
      type: 'text',
      text: `Collection '${newCollection.name}' was added and initialized`
    }
  } catch (error) {
    console.log('Error adding collection:', (error as Error).message)
    return {
      success: false,
      type: 'text',
      text: `Error adding collection: ${error}`
    }
  }
}
