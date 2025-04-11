import { createCollectionType } from '../../persistence/collection-types.js'
import { CollectionType } from '../../models/entities.js'
import { transformStringToJson, getToolsTextResponse } from '../../lib/utils.js'
import { getDynamicCollection } from '../../persistence/index.js'
import { z } from 'zod'
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'

const COLLECTION_TYPE_TOOL_DESCRIPTION = [
  'Add a collection type to the database. This allows the AI to define a collection',
  '(using a schema), that will be automatically created, and perform CRUD operations',
  'on that collection.'
].join(' ')

const COLLECTION_TYPE_PARAM_DESCRIPTION = [
  'Add a collection type to the database with a defined schema.',
  "The 'collection' parameter must be a JSON string (not an object)",
  'including the following properties: id, name, collection_name, description, and schema."',
  'The schema property should follow the JSON Schema format defined by: type, properties and required attributes.',
  'The schema properties must include a "summary" field of type string and a "order" field of type number.',
  'The order value must be increased with 1 for every document insert. Query results are sorted by the order field.',
  `If you don't know it, get the next order number from the get_next_in_order_sequence tool.`,
  'Using an "id" field is optional as "_id" UUIDs are auto generated.',
  'However, it is good to include "id" as deletion can only be done by "_id" or "id".',
  'Example: {"collection": "{"id":"products","name":"Products","collection_name":"products",',
  '"schema":{"type":"object","properties":{"id":{"type":"string"},"order": { "type": "number" },"name":{"type":"string"},',
  '"summary":{"type":"string"}},"required":["id","order","name","summary"]}}}'
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
      "order": { "type": "number" },
      "summary": {
        "type": "string",
        "description": "A concise description of the topic and conclusion"
      },
      "name": { "type": "string" },
      "price": { "type": "number" },
      "description": { "type": "string" },
      "inStock": { "type": "boolean" }
    },
    "required": ["id", "order", "name", "price", "summary"]
  }
}
`

export const addCollectionTypeSchema = {
  name: TOOL_NAME.ADD_COLLECTION_TYPE,
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
export async function addCollectionType(params: CallToolRequest['params']): Promise<CallToolResult> {
  console.log('Adding collection type:', params)
  let collection: string
  let jsonCollection: Record<string, unknown>
  let collectionType: CollectionType

  // Resolve the input parameters
  try {
    collection = z.string().min(1).parse(params?.arguments?.collection)
  } catch {
    return getToolsTextResponse(false, "'collection' must be present in the request params arguments")
  }

  // Parse the collection data from JSON string to JSON object
  console.log('Parsing collection data:', collection)

  try {
    jsonCollection = transformStringToJson(collection)
  } catch (error) {
    return getToolsTextResponse(
      false,
      `Invalid JSON in document: ${(error as Error)?.message ?? 'Unknown error'}`
    )
  }

  // Validate the collection schema
  try {
    collectionType = CollectionType.parse(jsonCollection)
  } catch (e) {
    console.log('ERROR', e)

    return getToolsTextResponse(
      false,
      "collectionType is invalid. Did you remember to include 'summary' (string) and 'order' (number) fields?"
    )
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

    return getToolsTextResponse(true, `Collection '${newCollection.name}' was added and initialized`)
  } catch (error) {
    console.log('Error adding collection:', (error as Error).message)
    return getToolsTextResponse(false, `Error adding collection: ${error}`)
  }
}
