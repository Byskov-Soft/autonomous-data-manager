import Djv from 'djv'
import { getCollectionTypeByCollectionName } from '../../persistence/collection-types.js'
import { getToolsTextResponse, transformStringToJson } from '../../lib/utils.js'
import { z, ZodError } from 'zod'
import { CollectionType } from '../../models/entities.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { getEnv } from '../../lib/env.js'
import { insertIntoCollection } from '../../persistence/index.js'
import { useLogger } from '../../lib/logger.js'
/**
 * Tool function to add multiple documents to a collection with schema validation
 * @param request - Tool request containing collection name and array of documents
 * @returns Tool return parameters with success/failure message
 */
export async function addBatchToCollection(params: CallToolRequest['params']): Promise<CallToolResult> {
  const log = useLogger()
  log.info('addBatchToCollection', params)

  // Resolve the input parameters
  const { collectionName, documents, errorResponse } = resolveInputParams(params)

  if (errorResponse) {
    return errorResponse
  }

  // Parse the documents data from JSON string to JSON array
  let jsonDocuments: Record<string, unknown>[]

  try {
    const parsed = transformStringToJson(documents)
    if (!Array.isArray(parsed)) {
      return getToolsTextResponse(false, 'Documents must be provided as an array')
    }
    jsonDocuments = parsed
  } catch (error) {
    log.error('Invalid JSON in documents:', error)
    return getToolsTextResponse(
      false,
      `Invalid JSON in documents: ${(error as Error)?.message ?? 'Unknown error'}`
    )
  }

  if (jsonDocuments.length === 0) {
    return getToolsTextResponse(false, 'No documents provided in the batch')
  }

  try {
    // Get the collection type metadata for schema validation
    const collectionType = await getCollectionTypeByCollectionName(collectionName)

    if (!collectionType) {
      log.error('Collection type not found:', collectionName)
      return getToolsTextResponse(false, `Collection '${collectionName}' does not exist`)
    }

    // Validate each document against the collection schema
    for (let i = 0; i < jsonDocuments.length; i++) {
      const errorResponse = validateJsonDocument(collectionName, jsonDocuments[i], collectionType)
      if (errorResponse) {
        return getToolsTextResponse(
          false,
          `Document at index ${i} failed validation: ${errorResponse.content[0].text}`
        )
      }
    }

    // Insert documents into collection
    log.info('Inserting documents into collection')
    const results = await Promise.all(jsonDocuments.map((doc) => insertIntoCollection(collectionName, doc)))

    let hasLargeText = false
    for (const doc of jsonDocuments) {
      for (const [key, value] of Object.entries(doc)) {
        if (
          typeof value === 'string' &&
          value.length > getEnv().LARGE_TEXT_THRESHOLD &&
          !value.startsWith('#')
        ) {
          hasLargeText = true
          break
        }
      }
      if (hasLargeText) break
    }

    const MARKDOWN_ENCOURAGEMENT = [
      'When adding large text values, it is encouraged to use Markdown format for better',
      'readability - use # for headers, ``` for code blocks, - for lists'
    ].join(' ')

    return getToolsTextResponse(
      true,
      [
        `Successfully added ${jsonDocuments.length} documents to collection '${collectionName}'`,
        hasLargeText ? `(Tip: ${MARKDOWN_ENCOURAGEMENT})` : ''
      ].join(' ')
    )
  } catch (error) {
    log.error('Error adding documents to collection:', error)
    return getToolsTextResponse(false, `Error adding documents to collection: ${(error as Error).message}`)
  }
}

const resolveInputParams = (
  params: CallToolRequest['params']
): {
  collectionName: string
  documents: string
  errorResponse: CallToolResult | null
} => {
  const { collection_name, documents } = params.arguments ?? {}

  try {
    return {
      collectionName: z.string().min(1).parse(collection_name),
      documents: z.string().min(1).parse(documents),
      errorResponse: null
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        collectionName: '',
        documents: '',
        errorResponse: getToolsTextResponse(
          false,
          "'collection_name' and 'documents' must be present in the request params arguments"
        )
      }
    }
    throw error
  }
}

const validateJsonDocument = (
  collectionName: string,
  jsonDocument: Record<string, unknown>,
  collectionType: CollectionType
): CallToolResult | void => {
  const log = useLogger()
  // Validate document against schema
  log.info('Validating JSON conformity. Schema:\n', collectionType.schema)
  const djv = Djv()
  djv.addSchema('test', collectionType.schema)
  const invalid = djv.validate('test', jsonDocument)

  if (invalid) {
    if (getEnv().COLLECTION_VALIDATION !== 'off') {
      return getToolsTextResponse(false, `Document does not match schema: ${JSON.stringify(invalid)}`)
    } else {
      // Log warning but continue if validation is disabled
      log.warn(
        `[WARNING] Document validation failed for collection '${collectionName}': ${JSON.stringify(invalid)}`
      )
    }
  }
}
