import { createCollectionType } from '../../persistence/collection-types.js'
import { CollectionType } from '../../models/entities.js'
import { transformStringToJson, getToolsTextResponse } from '../../lib/utils.js'
import { getDynamicCollection } from '../../persistence/index.js'
import { z } from 'zod'
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { useLogger } from '../../lib/logger.js'
/**
 * Tool function to add a new collection to the database
 * This function is used with the CallToolRequestSchema MCP handler
 *
 * @param collectionData - JSON string containing the collection data
 * @returns Object with success message and created collection details
 */
export async function addCollectionType(params: CallToolRequest['params']): Promise<CallToolResult> {
  const log = useLogger()
  log.info('Adding collection type:', params)
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
  log.info('Parsing collection data:', collection)

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
  } catch {
    return getToolsTextResponse(
      false,
      "collectionType is invalid. Did you remember to include a 'summary' field of type string?"
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

  log.info('Creating new collection type:', newCollection)

  try {
    const mongoCollection = await getDynamicCollection(newCollection.collection_name)
    // Create an index on the 'deleted' field if it doesn't exist
    await mongoCollection.createIndex({ deleted: 1 }, { sparse: true })

    await createCollectionType(newCollection)

    return getToolsTextResponse(true, `Collection '${newCollection.name}' was added and initialized`)
  } catch (error) {
    log.error('Error adding collection:', (error as Error).message)
    return getToolsTextResponse(false, `Error adding collection: ${error}`)
  }
}
