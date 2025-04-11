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

/**
 * Gets the next order number to use for a collection by finding the highest existing order
 * @param collectionName The name of the collection to check
 * @returns Promise resolving to the next order number (existing max + 1, or 1 if no entries)
 */
export async function getNextOrderNumber(collectionName: string): Promise<number> {
  const collection = await getDynamicCollection(collectionName)

  // Find the document with the highest order number
  const result = await collection.find({}).sort({ order: -1 }).limit(1).toArray()

  // If no documents exist or none have an order field, return 1
  if (!result.length || !result[0].order) {
    return 1
  }

  // Return the next order number
  return result[0].order + 1
}
