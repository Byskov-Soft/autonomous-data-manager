import { Collection } from 'mongodb'
import { useDatabase } from '../../lib/database.js'
import { getCollectionTypeByCollectionName } from '../collection-types.js'

/**
 * Get a dynamic collection by its name
 * @param collectionName The name of the collection to retrieve
 * @returns Promise resolving to the MongoDB collection
 */
export async function getDynamicCollection(collectionName: string): Promise<Collection> {
  const db = await useDatabase()
  return db.collection(collectionName)
}

/**
 * Validates that a collection exists in the registry
 * @param collectionName The name of the collection to validate
 */
export async function validateCollection(collectionName: string): Promise<void> {
  const collectionType = await getCollectionTypeByCollectionName(collectionName)
  if (!collectionType) {
    throw new Error(`Collection '${collectionName}' does not exist in registry`)
  }
}

/**
 * Creates a base query that excludes deleted records
 * @param query The original query to extend
 * @returns Query with deleted filter
 */
export function createBaseQuery(query: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...query,
    $or: [{ deleted: { $ne: true } }, { deleted: { $exists: false } }]
  }
}
