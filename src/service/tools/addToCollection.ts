import Djv from 'djv'
import { ToolInputParams, ToolReturnParams } from '../../models/types.js'
import { insertIntoCollection } from '../../persistence/persistCollectionData.js'
import { getCollectionTypeByCollectionName } from '../../persistence/persistCollectionType.js'
import { transformStringToJson } from '../../utils.js'
import { z, ZodError } from 'zod'
import { CollectionType } from '../../models/entities.js'
import { getEnv } from '../env.js'

const MARKDOWN_ENCOURAGEMENT =
  'Use Markdown format for better readability - use # for headers, ``` for code blocks, - for lists'

export const addToCollectionSchema = {
  name: 'add_to_collection',
  description: 'Add a document to a collection with schema validation',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Name of the collection to add the document to'
      },
      document: {
        type: 'string',
        description: [
          'JSON string containing the document to add to the collection.',
          "Must match the collection's schema. To ensure successful saving,",
          'always provide data to the MCP server in valid JSON format, remembering',
          'to properly escape special characters within string values.',
          'When adding large text values, it is encouraged to ' + MARKDOWN_ENCOURAGEMENT
        ].join(' ')
      }
    },
    required: ['collection_name', 'document']
  }
}

/**
 * Tool function to add a document to a collection with schema validation
 * @param params - Tool input parameters containing collection name and document
 * @returns Tool return parameters with success/failure message
 */
export async function addToCollection(params: ToolInputParams): Promise<ToolReturnParams> {
  console.log('addToCollection', params)

  // Resolve the input parameters
  const { collectionName, document, errorResponse } = resolveInputParams(params)

  if (errorResponse) {
    return errorResponse
  }

  // Parse the document data from JSON string to JSON object
  let jsonDocument: Record<string, unknown>

  try {
    jsonDocument = transformStringToJson(document)
  } catch (error) {
    console.log('Invalid JSON in document:', error)
    return {
      success: false,
      type: 'text',
      text: `Invalid JSON in document: ${(error as Error)?.message ?? 'Unknown error'}`
    }
  }

  try {
    // Get the collection type metadata for schema validation
    const collectionType = await getCollectionTypeByCollectionName(collectionName)

    if (!collectionType) {
      console.log('Collection type not found:', collectionName)
      return {
        success: false,
        type: 'text',
        text: `Collection '${collectionName}' does not exist`
      }
    }

    // Validate the document against the collection schema
    const errorResponse = validateJsonDocument(collectionName, jsonDocument, collectionType)

    if (errorResponse) {
      return errorResponse
    }

    // Insert document into collection
    console.log('Inserting document into collection')
    const ObjectId = await insertIntoCollection(collectionName, jsonDocument)
    let hasLargeText = false

    for (const [key, value] of Object.entries(jsonDocument)) {
      if (typeof value === 'string' && value.length > getEnv().LARGE_TEXT_THRESHOLD && !value.startsWith('#')) {
        hasLargeText = true
        break
      }
    }

    return {
      success: true,
      type: 'text',
      text: [
        `Document was added to collection '${collectionName}`,
        hasLargeText ? `(Tip: ${MARKDOWN_ENCOURAGEMENT})` : ''
      ].join(' '),
      object_id: ObjectId.toString()
    }
  } catch (error) {
    console.log('Error adding document to collection:', error)

    return {
      success: false,
      type: 'text',
      text: `Error adding document to collection: ${(error as Error).message}`
    }
  }
}

const resolveInputParams = (
  params: ToolInputParams
): {
  collectionName: string
  document: string
  errorResponse: ToolReturnParams | null
} => {
  const { collection_name, document: newDocument } = params.arguments ?? {}

  try {
    return {
      collectionName: z.string().min(1).parse(collection_name),
      document: z.string().min(1).parse(newDocument),
      errorResponse: null
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        collectionName: '',
        document: '',
        errorResponse: {
          success: false,
          type: 'text',
          text: "'collection_name' and 'document' must be present in the request params arguments"
        }
      }
    }
    throw error
  }
}

const validateJsonDocument = (
  collectionName: string,
  jsonDocument: Record<string, unknown>,
  collectionType: CollectionType
): ToolReturnParams | void => {
  // Validate document against schema
  console.log('Validating JSON conformity. Schema:\n', collectionType.schema)
  const djv = Djv()
  djv.addSchema('test', collectionType.schema)
  const invalid = djv.validate('test', jsonDocument)

  if (invalid) {
    if (getEnv().COLLECTION_VALIDATION !== 'off') {
      return {
        success: false,
        type: 'text',
        text: `Document does not match schema: ${JSON.stringify(invalid)}`
      }
    } else {
      // Log warning but continue if validation is disabled
      console.warn(
        `[WARNING] Document validation failed for collection '${collectionName}': ${JSON.stringify(invalid)}`
      )
    }
  }
}
