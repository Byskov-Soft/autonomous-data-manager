import { getDynamicCollection } from '../common.js'

/**
 * Update documents in a collection
 * @param collectionName The name of the collection to update
 * @param query The MongoDB query to select documents
 * @param update The MongoDB update operation
 * @returns Promise resolving to the number of documents updated
 */
export async function updateInCollection(
  collectionName: string,
  query: Record<string, unknown>,
  update: Record<string, unknown>
): Promise<number> {
  const collection = await getDynamicCollection(collectionName)
  const result = await collection.updateMany(query, { $set: update })
  return result.modifiedCount
}
