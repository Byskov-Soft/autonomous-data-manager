import { getDynamicCollection } from '../common.js'

/**
 * Delete documents in a collection
 * @param collectionName The name of the collection to delete from
 * @param query The MongoDB query to select documents to delete
 * @returns Promise resolving to the number of documents deleted
 */
export async function removeFromCollection(
  collectionName: string,
  query: Record<string, unknown>
): Promise<number> {
  const collection = await getDynamicCollection(collectionName)
  const result = await collection.deleteMany(query)
  return result.deletedCount
}
